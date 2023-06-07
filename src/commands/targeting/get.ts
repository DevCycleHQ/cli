import { Args, Flags } from '@oclif/core'
import inquirer from 'inquirer'
import { fetchTargetingForFeature } from '../../api/targeting'
import { featurePrompt } from '../../ui/prompts'
import Base from '../base'

export default class DetailedTargeting extends Base {
    static hidden = false
    static description = 'Retrieve Targeting for a Feature from the Management API'
    static examples = [
        '<%= config.bin %> <%= command.id %> feature-one',
        '<%= config.bin %> <%= command.id %> feature-one environment-one',
    ]
    static flags = {
        ...Base.flags,
        'env': Flags.string({
            char: 'e',
            description: 'Environment to fetch the Feature Configuration',
            required: false
        })
    }
    static args = {
        feature: Args.string({ description: 'The Feature to get the Targeting Rules' })
    }

    authRequired = true

    public async run(): Promise<void> {
        const { args, flags } = await this.parse(DetailedTargeting)

        await this.requireProject()

        let responses

        const feature = args['feature']
        const environment = flags.env

        if (flags.headless && !feature) {
            throw new Error('In headless mode, the feature is required')
        }

        if (feature) {
            responses = { _feature: feature }
        } else {
            responses = await inquirer.prompt(
                [featurePrompt],
                {
                    token: this.authToken,
                    projectKey: this.projectKey
                }
            )
        }

        if (environment) {
            const targetingForFeatureAndEnv = await fetchTargetingForFeature(
                this.authToken,
                this.projectKey,
                responses._feature,
                environment
            )
            return this.writer.showResults(targetingForFeatureAndEnv)
        }
        const targetingForFeature = await fetchTargetingForFeature(this.authToken, this.projectKey, responses._feature)
        return this.writer.showResults(targetingForFeature)
    }
}
