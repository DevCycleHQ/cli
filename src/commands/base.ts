import 'reflect-metadata'

import { Command, Flags } from '@oclif/core'
import fs from 'fs'
import path from 'path'
import jsYaml from 'js-yaml'
import { RepoConfigFromFile, UserConfigFromFile } from '../types'
import { ClassConstructor, plainToClass } from 'class-transformer'
import { validateSync } from 'class-validator'
import { reportValidationErrors, reportZodValidationErrors } from '../utils/reportValidationErrors'
import { getToken } from '../auth/getToken'
import { fetchProjects } from '../api/projects'
import { promptForProject } from '../ui/promptForProject'
import inquirer from 'inquirer'
import Writer from '../ui/writer'
import { errorMap, setDVCReferrer } from '../api/apiClient'
import { Prompt } from '../ui/prompts'
import { filterPrompts, mergeFlagsAndAnswers, validateParams } from '../utils/prompts'
import z, { ZodObject, ZodTypeAny, ZodError } from 'zod'

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
        'caller': Flags.string({
            description: 'The integration that is calling the CLI.',
            helpGroup: 'Global',
            options: [
                'github.pr_insights',
                'github.code_usages',
                'bitbucket.pr_insights',
                'bitbucket.code_usages',
                'cli'
            ],
            hidden: true
        }),
    }

    authToken = ''
    projectKey = ''
    authPath = path.join(this.config.configDir, 'auth.yml')
    configPath = path.join(this.config.configDir, 'user.yml')
    repoConfigPath = '.devcycle/config.yml'
    noApi = false
    caller = 'cli'

    // Override to true in commands that must be authorized in order to function
    authRequired = false
    // Override to true in commands that have "enhanced" functionality enabled by API access
    authSuggested = false
    // Override to true in commands that expect to run in the repo
    runsInRepo = false

    userConfig: UserConfigFromFile | null
    repoConfig: RepoConfigFromFile | null
    writer: Writer = new Writer()

    async catch(error: unknown) {
        if (error instanceof ZodError) {
            this.reportZodValidationErrors(error)
        } else if (error instanceof Error) {
            this.writer.showError(error.message)
        }
    }
    private async authorizeApi(): Promise<void> {
        const { flags } = await this.parse(this.constructor as typeof Base)

        this.authToken = await getToken(this.authPath, flags)
        if (!this.hasToken()) {
            if (this.authRequired) {
                throw new Error(
                    'Authorization is required to use this command.\n' +
                    'Please login using "dvc login sso" ' +
                    'or pass credentials using the --client-id and --client-secret flags.'
                )
            } else if (this.authSuggested && !flags['no-api']) {
                this.writer.warningMessage(
                    'This command has limited functionality without Authorization.' +
                    'Use the "--no-api" flag to suppress this warning',
                )
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
        reportValidationErrors(errors)

        return configParsed
    }

    private loadRepoConfig(path: string): RepoConfigFromFile | null {
        if (!fs.existsSync(path)) {
            return null
        }

        const config = jsYaml.load(fs.readFileSync(path, 'utf8'))
        const configParsed = plainToClass(RepoConfigFromFile, config)
        const errors = validateSync(configParsed)
        reportValidationErrors(errors)

        return configParsed
    }

    updateUserConfig(
        changes: Partial<UserConfigFromFile>
    ): UserConfigFromFile | null {
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

    updateRepoConfig(
        changes: Partial<RepoConfigFromFile>
    ): RepoConfigFromFile | null {
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

        if (flags['no-api']) {
            this.noApi = flags['no-api']
        }

        if (flags['caller']) {
            this.caller = flags['caller']
        }

        this.userConfig = this.loadUserConfig(this.configPath)
        this.repoConfig = this.loadRepoConfig(this.repoConfigPath)
        this.projectKey = flags['project']
            || process.env.DVC_PROJECT_KEY
            || this.runsInRepo && this.repoConfig?.project
            || this.userConfig?.project
            || ''
        await this.authorizeApi()
        setDVCReferrer(this.id, this.config.version, this.caller)
    }

    async requireProject(): Promise<void> {
        if (this.projectKey !== '') {
            return
        }
        const projects = await fetchProjects(this.authToken)
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
        return this.authToken !== ''
    }

    public async populateParameters<ResourceType>(
        paramClass: ClassConstructor<ResourceType>,
        prompts: Prompt[],
        flags: Record<string, unknown> = {},
        isUpdate = false,
    ): Promise<ResourceType> {
        if (flags.headless) {
            const params = plainToClass(paramClass, flags)
            validateParams(paramClass, params, { whitelist: true, skipMissingProperties: isUpdate })
            return params
        }

        const filteredPrompts = filterPrompts(prompts, flags)
        const answers = await this.populateParametersWithInquirer(filteredPrompts)

        const params = plainToClass(paramClass, mergeFlagsAndAnswers(flags, answers))
        validateParams(paramClass, params, { whitelist: true, skipMissingProperties: isUpdate })
        return params
    }

    public async populateParametersWithZod
    <ResourceType extends Record<string, ZodTypeAny>>(
        schema: ZodObject<ResourceType>,
        prompts: Prompt[],
        flags: Record<string, unknown>,
    ): Promise<z.infer<typeof schema>> {
        let input = flags
        if (!flags.headless) {
            const filteredPrompts = filterPrompts(prompts, flags)
            const answers = await this.populateParametersWithInquirer(filteredPrompts)
            input = mergeFlagsAndAnswers(flags, answers)
        }
        const parse = schema.parse(
            input,
            { errorMap }
        )
        return parse
    }

    protected async populateParametersWithInquirer(prompts: Prompt[]) {
        if (!prompts.length) return
        return inquirer.prompt(prompts, {
            token: this.authToken,
            projectKey: this.projectKey
        })
    }

    protected reportZodValidationErrors(error: ZodError): void {
        reportZodValidationErrors(error, this.writer)
    }
}
