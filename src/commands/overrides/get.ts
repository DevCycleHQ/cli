import { Flags } from '@oclif/core'
import inquirer from '../../ui/autocomplete'
import {
    environmentPrompt, 
    EnvironmentPromptResult, 
    featurePrompt, 
    FeaturePromptResult 
} from '../../ui/prompts'
import Base from '../base'
import { fetchFeatureOverridesForUser } from '../../api/overrides'
import { fetchEnvironmentByKey } from '../../api/environments'
import { fetchVariationByKey } from '../../api/variations'

export default class DetailedTargeting extends Base {
    static hidden = false
    authRequired = true
    static description = 'View the overrides associated with your DevCycle Identity in your current project.'
    prompts = [
        featurePrompt,
        environmentPrompt
    ]
    static args = {}
    static flags = {
        feature: Flags.string({
            name: 'feature',
            description: 'The key or id of the Feature to get Overrides for',
        }),
        environment: Flags.string({
            name: 'environment',
            description: 'The key or id of the Environment to get Overrides for',
        }),
        ...Base.flags,
    }

    public async run(): Promise<void> {
        const { flags } = await this.parse(DetailedTargeting)
        const { headless, project } = flags
        let { feature: featureKey, environment: environmentKey } = flags
        await this.requireProject(project, headless)

        if (headless && (!featureKey || !environmentKey)) {
            this.writer.showError('Feature and Environment arguments are required')
            return
        }

        if (!featureKey) {
            const featurePromptResult = await inquirer.prompt<FeaturePromptResult>([featurePrompt], {
                token: this.authToken,
                projectKey: this.projectKey
            })
            featureKey = featurePromptResult.feature.key
        }

        if (!environmentKey) {
            const { environment: environmentPromptResult } = await inquirer.prompt<EnvironmentPromptResult>(
                [environmentPrompt], {
                    token: this.authToken,
                    projectKey: this.projectKey
                })
            environmentKey = environmentPromptResult.key
        }

        const overrides = await fetchFeatureOverridesForUser(this.authToken, this.projectKey, featureKey) 
        const environment = await fetchEnvironmentByKey(this.authToken, this.projectKey, environmentKey)
        const override = overrides.overrides.find((override) => override._environment === environment._id)

        if (!override) {
            if (headless) {
                this.writer.showResults({ environment: environment.key, variation: null })
                return
            }
            this.writer.showError(
                `Override for feature: ${featureKey} on environment: ${environment.key} is variation: <not-set>`
            )
            this.writer.infoMessageWithCommand('To set an override, use: ', 'dvc overrides update')
            return
        }

        const variation = await fetchVariationByKey(this.authToken, this.projectKey, featureKey, override._variation)

        if (headless) {
            this.writer.showResults({ environment: environment.key, variation: variation.key })
            return
        }

        this.writer.successMessage(
            `Override for feature: ${featureKey} on environment: ${environment.key} is variation: ${variation.key}`
        ) 
    }
}
