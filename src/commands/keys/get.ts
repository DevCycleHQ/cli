import { Flags } from '@oclif/core'
import inquirer from '../../ui/autocomplete'
import { APIKey, fetchEnvironmentByKey } from '../../api/environments'
import { EnvironmentPromptResult, environmentPrompt, sdkKeyTypePrompt as sdkTypePrompt } from '../../ui/prompts'
import Base from '../base'

export default class GetEnvironmentKey extends Base {
    static hidden = false
    static description = 'Retrieve SDK keys from the Management API.'
    static examples = [
        '<%= config.bin %> <%= command.id %>',
        '<%= config.bin %> <%= command.id %> --keys=environment-one,environment-two'
    ]
    static flags = {
        ...Base.flags,
        'env': Flags.string({
            description: 'Environment to fetch a key for',
        }),
        'type': Flags.string({
            options: ['mobile', 'client', 'server'],
            description: 'The type of SDK key to retrieve',
        })
    }
    authRequired = true

    public async run(): Promise<void> {
        const { flags } = await this.parse(GetEnvironmentKey)
        const { project, headless } = flags
        await this.requireProject(project, headless)

        if (flags.headless && !flags.env) {
            throw (new Error('In headless mode, the env flag is required'))
        }

        const environmentKey = await this.getEnvironmentKey()
        const environment = await fetchEnvironmentByKey(
            this.authToken,
            this.projectKey,
            environmentKey
        )
        if (!environment) {
            return
        }
        const sdkType = await this.getSdkType()
        if (sdkType && sdkType !== 'all') {
            const activeKeys = environment.sdkKeys[sdkType] as APIKey[]
            const currentKey = activeKeys[activeKeys.length - 1]
            if (currentKey.compromised) {
                this.writer.warningMessage(`The most recent key for ${environmentKey} ${sdkType} has been compromised}`)
            }
            this.writer.showRawResults(currentKey.key)
        } else {
            this.writer.showResults(environment.sdkKeys)
        }
    }

    private async getEnvironmentKey(): Promise<string> {
        const { flags } = await this.parse(GetEnvironmentKey)
        if (flags.env) {
            return flags.env
        }
        const responses = await inquirer.prompt<EnvironmentPromptResult>([environmentPrompt],
            {
                token: this.authToken,
                projectKey: this.projectKey
            })
        return responses.environment._id
    }

    private async getSdkType(): Promise<'mobile' | 'client' | 'server' | 'all'> {
        const { flags } = await this.parse(GetEnvironmentKey)
        let sdkType = flags.type

        if (!sdkType) {
            const responses = await inquirer.prompt([sdkTypePrompt],
                {
                    token: this.authToken,
                    projectKey: this.projectKey
                })
            sdkType = responses.sdkType
        }

        if (sdkType && isSdkType(sdkType)) {
            return sdkType
        }
        return 'all'
    }
}

const isSdkType = (sdkType: string): sdkType is 'mobile' | 'client' | 'server' | 'all' => {
    return ['mobile', 'client', 'server', 'all'].includes(sdkType)
}
