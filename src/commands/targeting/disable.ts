import { Args } from '@oclif/core'
import inquirer from '../../ui/autocomplete'
import { disableTargeting } from '../../api/targeting'
import { EnvironmentPromptResult, environmentPrompt, featurePrompt } from '../../ui/prompts'
import Base from '../base'

export default class DisableTargeting extends Base {
    static hidden = false
    static description = 'Disable the Targeting for the specified Environment on a Feature'
    static examples = [
        '<%= config.bin %> <%= command.id %> feature-one environment-one',
    ]
    static flags = Base.flags
    static args = {
        feature: Args.string({ description: 'The Feature for the Targeting Rules' }),
        environment: Args.string({ description: 'The Environment where the Targeting Rules will be enabled' })
    }

    authRequired = true

    public async run(): Promise<void> {
        const { args, flags } = await this.parse(DisableTargeting)

        await this.requireProject()

        let responses

        const feature = args['feature']
        const environment = args['environment']

        if (flags.headless && (!feature || !environment)) {
            throw new Error('In headless mode, both the feature and environment are required')
        }

        if (feature) {
            responses = { featureKey: feature }
        } else {
            const userSelectedFeature = await inquirer.prompt(
                [featurePrompt],
                {
                    token: this.authToken,
                    projectKey: this.projectKey
                }
            )
            responses = { featureKey: userSelectedFeature.feature }
        }

        if (environment) {
            responses = { ...responses, environmentKey: environment }
        } else {
            const userSelectedEnv = await inquirer.prompt<EnvironmentPromptResult>(
                [environmentPrompt],
                {
                    token: this.authToken,
                    projectKey: this.projectKey
                }
            )
            responses = { ...responses, environmentKey: userSelectedEnv.environment._id }
        }

        const disableTargetingForFeatureAndEnvironment = await disableTargeting(
            this.authToken,
            this.projectKey,
            responses.featureKey,
            responses.environmentKey
        )
        return this.writer.showResults(disableTargetingForFeatureAndEnvironment)
    }
}
