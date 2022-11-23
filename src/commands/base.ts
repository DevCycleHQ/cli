import 'reflect-metadata'

import { Command, Flags } from '@oclif/core'
import { getToken } from '../auth/getToken'
import { fetchProjects } from '../api/projects'
import { promptForProject } from '../ui/promptForProject'
import inquirer from 'inquirer'
import Writer from '../ui/writer'
import DVCConfig from '../utils/files/dvcConfig'
import DVCFiles from '../utils/files/dvcFiles'
import Roots from '../utils/files/roots'

export default abstract class Base extends Command {
    static hidden = true
    public static storage: DVCFiles = new DVCFiles()
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

    // Override to true in commands that must be authorized in order to function
    authRequired = false
    // Override to true in commands that have "enhanced" functionality enabled by API access
    authSuggested = false
    // Override to trye in commands that expect to run in the repo
    runsInRepo = false

    writer: Writer = new Writer()
    dvcConfig: DVCConfig

    private async authorizeApi(): Promise<void> {
        const { flags } = await this.parse(this.constructor as typeof Base)

        if (flags['no-api']) {
            return
        }

        this.token = await getToken(this.dvcConfig, flags)
        if (!this.hasToken()) {
            if (this.authRequired) {
                throw new Error('Authorization is required to use this command.')
            } else if (this.authSuggested) {
                this.writer.warningMessage('This command has limited functionality without Authorization.' +
                    'Use the "--no-api" flag to suppress this warning')
            }
            return
        }
    }

    async init(): Promise<void> {
        const { flags } = await this.parse(this.constructor as typeof Base)
        this.writer.headless = flags.headless
        this.dvcConfig = new DVCConfig(Base.storage, this.writer)

        Base.storage.defineRoot(Roots.auth, await this.getAuthPath())
        Base.storage.defineRoot(Roots.user, await this.getUserPath())
        Base.storage.defineRoot(Roots.repo, await this.getRepoPath())

        const userConfig = this.dvcConfig.getUser()
        const repoConfig = this.dvcConfig.getRepo()

        this.projectKey = flags['project']
            || process.env.DVC_PROJECT_KEY
            || this.runsInRepo && repoConfig?.project
            || userConfig?.project
            || ''
        await this.authorizeApi()
    }

    async getAuthPath(): Promise<string> {
        const { flags } = await this.parse(this.constructor as typeof Base)
        return flags['auth-path'] || this.config.configDir
    }

    async getUserPath(): Promise<string> {
        const { flags } = await this.parse(this.constructor as typeof Base)
        return flags['config-path'] || this.config.configDir
    }

    async getRepoPath(): Promise<string> {
        const { flags } = await this.parse(this.constructor as typeof Base)
        return flags['repo-config-path'] || './'
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
            await this.dvcConfig.updateUserConfig({
                project: this.projectKey
            })
        }
    }

    hasToken(): boolean {
        return this.token !== ''
    }
}
