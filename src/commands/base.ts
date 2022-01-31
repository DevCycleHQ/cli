import 'reflect-metadata'

import { Command, Flags } from '@oclif/core'
import fs from 'fs'
import jsYaml from 'js-yaml'
import { AuthFromFile, ConfigFromFile } from '../types'
import { plainToClass } from 'class-transformer'
import { validateSync, ValidationError } from 'class-validator'
import { authenticate } from '../api/authenticate'

export default abstract class Base extends Command {
    static hidden = true
    static flags = {
        'config-path': Flags.string({
            description: 'Override the default location to look for a config.yml file',
            default: '.devcycle/config.yml'
        }),
        'auth-path': Flags.string({
            description: 'Override the default location to look for an auth.yml file',
            default: '.devcycle/auth.yml'
        }),
        'client-id': Flags.string({
            description: 'Client ID to use for DevCycle API Authorization',
        }),
        'client-secret': Flags.string({
            description: 'Client Secret to use for DevCycle API Authorization',
        }),
        'project': Flags.string({
            description: 'Project key to use for the DevCycle API requests',
        }),
        'no-api': Flags.boolean({
            description: 'Disable API-based enhancements for commands where authorization is optional. Suppresses ' +
                'warnings about missing credentials.'
        })
    }

    token: string | null = null
    projectKey: string | null = null

    // Override to true in commands that must be authorized in order to function
    authRequired = false
    // Override to true in commands that have "enhanced" functionality enabled by API access
    authSuggested = false

    configFromFile: ConfigFromFile | null

    reportValidationErrors(name: string, errors: ValidationError[]): void {
        if (errors.length) {
            let error = errors[0]
            while (error.children?.length) {
                error = error.children[0]
            }

            this.error(`${name} file failed validation at property "${error.property}": ` +
                `${Object.values(error.constraints ?? {})[0]}`)
        }
    }

    private async authorizeApi(projectFromConfig?: string): Promise<void> {
        const { flags } = await this.parse(this.constructor as typeof Base)

        let clientId = flags['client-id'] || process.env.DVC_CLIENT_ID
        let clientSecret = flags['client-secret'] || process.env.DVC_CLIENT_SECRET
        this.projectKey = flags['project'] || process.env.DVC_PROJECT_KEY || projectFromConfig || null
        const path = flags['auth-path']

        if (fs.existsSync(path) && !(clientId && clientSecret)) {
            const authorization = jsYaml.load(fs.readFileSync(path, 'utf8'))
            const authorizationParsed = plainToClass(AuthFromFile, authorization)
            const errors = validateSync(authorizationParsed)
            this.reportValidationErrors('Authorization', errors)

            clientId = authorizationParsed.client_id
            clientSecret = authorizationParsed.client_secret
        }

        if (!(clientId && clientSecret && this.projectKey)) {
            if (this.authRequired) {
                this.error('You must provide a client ID, client secret and project key to use this command.')
            } else if (this.authSuggested && !flags['no-api']) {
                this.warn('You should provide a client ID,' +
                    ' client secret and project key to use the additional API enrichment of this command.')
            }
            return
        }

        this.token = await authenticate(clientId, clientSecret)
    }

    private loadConfig(path: string): ConfigFromFile | null {
        if (!fs.existsSync(path)) {
            return null
        }

        const config = jsYaml.load(fs.readFileSync(path, 'utf8'))

        const configParsed = plainToClass(ConfigFromFile, config)

        const errors = validateSync(configParsed)

        this.reportValidationErrors('Config', errors)

        return configParsed
    }

    async init(): Promise<void> {
        const { flags } = await this.parse(this.constructor as typeof Base)
        this.configFromFile = this.loadConfig(flags['config-path'])
        await this.authorizeApi(this.configFromFile?.project)
    }
}
