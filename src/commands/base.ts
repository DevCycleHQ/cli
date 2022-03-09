import 'reflect-metadata'

import { Command, Flags } from '@oclif/core'
import fs from 'fs'
import path from 'path'
import jsYaml from 'js-yaml'
import { ConfigFromFile } from '../types'
import { plainToClass } from 'class-transformer'
import { validateSync } from 'class-validator'
import { reportValidationErrors } from '../utils/reportValidationErrors'
import { getToken } from '../auth/getToken'
import { fetchProjects } from '../api/projects'
import { promptForProject } from '../ui/promptForProject'
import inquirer from 'inquirer'

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

    token = ''
    projectKey = ''

    // Override to true in commands that must be authorized in order to function
    authRequired = false
    // Override to true in commands that have "enhanced" functionality enabled by API access
    authSuggested = false

    configFromFile: ConfigFromFile | null

    private async authorizeApi(): Promise<void> {
        const { flags } = await this.parse(this.constructor as typeof Base)

        this.token = await getToken(flags)
        if (!this.hasToken()) {
            if (this.authRequired) {
                throw new Error('Authorization is required to use this command.')
            } else if (this.authSuggested && !flags['no-api']) {
                throw new Error('This command has limited functionality without Authorization. Use the "--no-api" flag to suppress this error')
            }
            return
        }
    }

    private loadConfig(path: string): ConfigFromFile | null {
        if (!fs.existsSync(path)) {
            return null
        }

        const config = jsYaml.load(fs.readFileSync(path, 'utf8'))
        const configParsed = plainToClass(ConfigFromFile, config)
        const errors = validateSync(configParsed)
        reportValidationErrors('Config', errors)

        return configParsed
    }

    async updateConfig(
        changes:Partial<ConfigFromFile>
    ): Promise<ConfigFromFile | null> {
        const { flags } = await this.parse(this.constructor as typeof Base)
        const configPath = flags['config-path']

        let config = this.loadConfig(configPath)
        if (!config) {
            const configDir = path.dirname(configPath)
            fs.mkdirSync(configDir, { recursive: true })
            config = new ConfigFromFile()
        }

        config = {
            ...config,
            ...changes
        }

        fs.writeFileSync(configPath, jsYaml.dump(config))

        return config
    }

    async init(): Promise<void> {
        const { flags } = await this.parse(this.constructor as typeof Base)
        this.configFromFile = this.loadConfig(flags['config-path'])
        this.projectKey = flags['project']
            || process.env.DVC_PROJECT_KEY
            || this.configFromFile?.project
            || ''
        await this.authorizeApi()
    }

    async requireProject(): Promise<void> {
        if (this.projectKey !== '') {
            return
        }
        const projects = await fetchProjects(this.token)
        const project = await promptForProject(projects)
        this.projectKey = project.key
        const { shouldSave } = await inquirer.prompt([{
            name: 'shouldSave',
            message: 'Do you want to use this project for all future commands?',
            type: 'confirm'
        }])
        if (shouldSave) {
            await this.updateConfig({ project:this.projectKey })
        }
    }

    hasToken():boolean {
        return this.token !== ''
    }
}
