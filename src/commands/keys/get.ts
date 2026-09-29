import { Flags } from '@oclif/core'
import inquirer from '../../ui/autocomplete'
import { APIKey, fetchEnvironmentByKey } from '../../api/environments'
import {
    EnvironmentPromptResult,
    environmentPrompt,
    sdkKeyTypePrompt as sdkTypePrompt,
} from '../../ui/prompts'
import Base from '../base'
import chalk from 'chalk'

export default class GetEnvironmentKey extends Base {
    static hidden = false
    static description = 'Retrieve SDK keys from the Management API.'
    static examples = [
        '<%= config.bin %> <%= command.id %>',
        '<%= config.bin %> <%= command.id %> --env=production --type=server',
    ]
    static flags = {
        ...Base.flags,
        env: Flags.string({
            description: 'Environment to fetch a key for',
        }),
        type: Flags.string({
            options: ['mobile', 'client', 'server', 'all'],
            description: 'The type of SDK key to retrieve',
        }),
    }
    authRequired = true

    public async run(): Promise<void> {
        const { flags } = await this.parse(GetEnvironmentKey)
        const { project, headless } = flags
        await this.requireProject(project, headless)

        if (flags.headless && (!flags.env || !flags.type)) {
            throw new Error(
                'In headless mode, the env and type flags are required',
            )
        }

        const environmentKey = await this.getEnvironmentKey()
        const environment = await fetchEnvironmentByKey(
            this.authToken,
            this.projectKey,
            environmentKey,
        )
        const sdkType = await this.getSdkType()
        if (sdkType === 'all') {
            this.writer.showResults(environment.sdkKeys)
            return
        }

        const activeKeys = environment.sdkKeys[sdkType] as APIKey[]
        if (!activeKeys?.length) {
            throw new Error(
                `No ${sdkType} SDK keys found for environment ${environmentKey}`,
            )
        }

        // the API appends new keys, so reverse to put the most recent first
        const keysNewestFirst = [...activeKeys].reverse()
        if (keysNewestFirst.every(({ key }) => !key)) {
            throw new Error(
                `Your credentials do not have permission to view ${sdkType} SDK keys for environment ` +
                    `${environmentKey}. Publisher permissions are required for protected environments.`,
            )
        }

        this.writer.showRawResults(
            keysNewestFirst
                .map(({ key, compromised }) =>
                    compromised ? `${key} (compromised)` : key,
                )
                .join('\n'),
        )
    }

    private async getEnvironmentKey(): Promise<string> {
        const { flags } = await this.parse(GetEnvironmentKey)
        if (flags.env) {
            return flags.env
        }
        this.writer.infoMessage(
            `Fetched keys from project with key ${chalk.green(this.projectKey)} in organization ${chalk.green(this.organization?.display_name)}`,
        )
        const responses = await inquirer.prompt<EnvironmentPromptResult>(
            [environmentPrompt],
            {
                token: this.authToken,
                projectKey: this.projectKey,
            },
        )
        return responses.environment._id
    }

    private async getSdkType(): Promise<
        'mobile' | 'client' | 'server' | 'all'
    > {
        const { flags } = await this.parse(GetEnvironmentKey)
        let sdkType = flags.type

        if (!sdkType) {
            const responses = await inquirer.prompt([sdkTypePrompt], {
                token: this.authToken,
                projectKey: this.projectKey,
            })
            sdkType = responses.sdkType
        }

        if (sdkType && isSdkType(sdkType)) {
            return sdkType
        }
        return 'all'
    }
}

const isSdkType = (
    sdkType: string,
): sdkType is 'mobile' | 'client' | 'server' | 'all' => {
    return ['mobile', 'client', 'server', 'all'].includes(sdkType)
}
