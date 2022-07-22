import 'reflect-metadata'

import { Command, Flags } from '@oclif/core'
import fs from 'fs'
import path from 'path'
import jsYaml from 'js-yaml'
import { RepoConfigFromFile, UserConfigFromFile } from '../types'
import { plainToClass } from 'class-transformer'
import { validateSync } from 'class-validator'
import { reportValidationErrors } from '../utils/reportValidationErrors'
import { getToken } from '../auth/getToken'
import { fetchProjects } from '../api/projects'
import { promptForProject } from '../ui/promptForProject'
import inquirer from 'inquirer'
import Writer from '../ui/writer'

export default abstract class Base extends Command {
    static hidden = true
    static flags = {
        'config-path': Flags.string({
            description: 'Override the default location to look for the user.yml file',
            helpGroup: 'Global'
        }),
        'auth-path': Flags.string({
            description: 'Override the default location to look for an auth.yml file',
            helpGroup: 'Global'
        }),
        'repo-config-path': Flags.string({
            description: 'Override the default location to look for the repo config.yml file',
            helpGroup: 'Global'
        }),
        'client-id': Flags.string({
            description: 'Client ID to use for DevCycle API Authorization',
            helpGroup: 'Global'
        }),
        'client-secret': Flags.string({
            description: 'Client Secret to use for DevCycle API Authorization',
            helpGroup: 'Global'
        }),
        'project': Flags.string({
            description: 'Project key to use for the DevCycle API requests',
            helpGroup: 'Global'
        }),
        'no-api': Flags.boolean({
            description: 'Disable API-based enhancements for commands where authorization is optional. Suppresses ' +
                'warnings about missing credentials.',
            helpGroup: 'Global'
        }),
        'headless': Flags.boolean({
            description: 'Disable all interactive flows and format output for easy parsing.',
            helpGroup: 'Global'
        }),
    }

    token = ''
    projectKey = ''
    authPath = path.join(this.config.configDir, 'auth.yml')
    configPath = path.join(this.config.configDir, 'user.yml')
    repoConfigPath = '.devcycle/config.yml'

    // Override to true in commands that must be authorized in order to function
    authRequired = false
    // Override to true in commands that have "enhanced" functionality enabled by API access
    authSuggested = false
    // Override to trye in commands that expect to run in the repo
    runsInRepo = false

    userConfig: UserConfigFromFile | null
    repoConfig: RepoConfigFromFile | null
    writer: Writer = new Writer()

    private async authorizeApi(): Promise<void> {
        const { flags } = await this.parse(this.constructor as typeof Base)

        this.token = await getToken(this.authPath, flags)
        if (!this.hasToken()) {
            if (this.authRequired) {
                throw new Error('Authorization is required to use this command.')
            } else if (this.authSuggested && !flags['no-api']) {
                console.warn('This command has limited functionality without Authorization.' +
                    'Use the "--no-api" flag to suppress this warning')
            }
            return
        }
    }

    private loadUserConfig(path: string): UserConfigFromFile | null {
        if (!fs.existsSync(path)) {
            return null
        }

        const config = jsYaml.load(fs.readFileSync(path, 'utf8'))
        const configParsed = plainToClass(UserConfigFromFile, config)
        const errors = validateSync(configParsed)
        reportValidationErrors('Config', errors)

        return configParsed
    }

    private loadRepoConfig(path: string): RepoConfigFromFile | null {
        if (!fs.existsSync(path)) {
            return null
        }

        const config = jsYaml.load(fs.readFileSync(path, 'utf8'))
        const configParsed = plainToClass(RepoConfigFromFile, config)
        const errors = validateSync(configParsed)
        reportValidationErrors('Config', errors)

        return configParsed
    }

    async updateUserConfig(
        changes: Partial<UserConfigFromFile>
    ): Promise<UserConfigFromFile | null> {
        let config = this.loadUserConfig(this.configPath)
        if (!config) {
            const configDir = path.dirname(this.configPath)
            fs.mkdirSync(configDir, { recursive: true })
            config = new UserConfigFromFile()
        }

        config = {
            ...config,
            ...changes
        }

        fs.writeFileSync(this.configPath, jsYaml.dump(config))
        this.writer.successMessage(`Configuration saved to ${this.configPath}`)

        return config
    }

    async updateRepoConfig(
        changes: Partial<RepoConfigFromFile>
    ): Promise<RepoConfigFromFile | null> {
        let config = this.loadRepoConfig(this.repoConfigPath)
        if (!config) {
            const configDir = path.dirname(this.repoConfigPath)
            fs.mkdirSync(configDir, { recursive: true })
            config = new RepoConfigFromFile()
        }

        config = {
            ...config,
            ...changes
        }

        fs.writeFileSync(this.repoConfigPath, jsYaml.dump(config))
        this.writer.successMessage(`Repo configuration saved to ${this.repoConfigPath}`)

        return config
    }

    async init(): Promise<void> {
        const { flags } = await this.parse(this.constructor as typeof Base)
        this.writer.headless = flags.headless

        if (flags['auth-path']) {
            this.authPath = flags['auth-path']
        }

        if (flags['config-path']) {
            this.configPath = flags['config-path']
        }

        if (flags['repo-config-path']) {
            this.repoConfigPath = flags['repo-config-path']
        }

        this.userConfig = this.loadUserConfig(this.configPath)
        this.repoConfig = this.loadRepoConfig(this.repoConfigPath)
        this.projectKey = flags['project']
            || process.env.DVC_PROJECT_KEY
            || this.runsInRepo && this.repoConfig?.project
            || this.userConfig?.project
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
            await this.updateUserConfig({ project: this.projectKey })
        }
    }

    hasToken(): boolean {
        return this.token !== ''
    }
}
