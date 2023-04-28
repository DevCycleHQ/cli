import { Flags } from '@oclif/core'
import inquirer from 'inquirer'
import { APIKey, fetchEnvironmentByKey } from '../../api/environments'
import {
    environmentIdPrompt,
    sdkKeyTypePrompt as sdkTypePrompt,
} from '../../ui/prompts'
import Base from '../base'

export default class GetEnvironmentKey extends Base {
    static hidden = false
    static description = 'Retrieve SDK keys from the management API'
    static examples = [
        '<%= config.bin %> <%= command.id %>',
        '<%= config.bin %> <%= command.id %> --keys=environment-one,environment-two',
    ]
    static flags = {
        ...Base.flags,
        env: Flags.string({
            description: 'Environment to fetch a key for',
        }),
        type: Flags.enum({
            options: ['mobile', 'client', 'server'],
            description: 'The type of SDK key to retrieve',
        }),
    }
    authRequired = true

    public async run(): Promise<void> {
        const { flags } = await this.parse(GetEnvironmentKey)
        await this.requireProject()

        if (flags.headless && !flags.env) {
            throw new Error('In headless mode, the env flag is required')
        }

        const environmentKey = await this.getEnvironmentKey()
        const environment = await fetchEnvironmentByKey(
            this.token,
            this.projectKey,
            environmentKey,
        )
        if (!environment) {
            return
        }
        const sdkType = await this.getSdkType()
        if (sdkType && sdkType !== 'all') {
            const activeKeys = environment.sdkKeys[sdkType] as APIKey[]
            const currentKey = activeKeys[activeKeys.length - 1]
            if (currentKey.compromised) {
                this.writer.warningMessage(
                    `The most recent key for ${environmentKey} ${sdkType} has been compromised}`,
                )
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
        const responses = await inquirer.prompt([environmentIdPrompt], {
            token: this.token,
            projectKey: this.projectKey,
        })
        return responses._environment
    }

    private async getSdkType(): Promise<string> {
        const { flags } = await this.parse(GetEnvironmentKey)
        if (flags.type) {
            return flags.type
        }
        const responses = await inquirer.prompt([sdkTypePrompt], {
            token: this.token,
            projectKey: this.projectKey,
        })
        return responses.sdkType
    }
}
