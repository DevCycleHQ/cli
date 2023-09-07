import { Flags } from '@oclif/core'
import inquirer from '../../ui/autocomplete'
import { 
    environmentPrompt, 
    EnvironmentPromptResult, 
    featurePrompt, 
    FeaturePromptResult 
} from '../../ui/prompts'
import Base from '../base'
import { fetchOverrides } from '../../api/overrides'

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
        const { args, flags } = await this.parse(DetailedTargeting)
        const { headless, project, feature, environment } = flags

        await this.requireProject(project, headless)
        let overrides
        let featureKey, environmentKey

        featureKey = feature
        environmentKey = environment

        if (!headless) {
            Object.keys(args).forEach((key) => {
                this.prompts = this.prompts.filter((prompt) => prompt.name !== key)
            })

            if (!feature) {
                const featurePromptResult = await inquirer.prompt<FeaturePromptResult>([featurePrompt], {
                    token: this.authToken,
                    projectKey: this.projectKey
                })
                featureKey = featurePromptResult.feature.key
            }
    
            if (!environment) {
                const { environment: environmentPromptResult } = await inquirer.prompt<EnvironmentPromptResult>(
                    [environmentPrompt], {
                        token: this.authToken,
                        projectKey: this.projectKey
                    })
                environmentKey = environmentPromptResult.key
            }
        } else if (!feature || !environment) {
            this.writer.showError('Feature and environment arguments are required')
            return
        }

        overrides = await fetchOverrides(this.authToken, this.projectKey, featureKey) 

        // TODO: figure out how to access variationKey from overrides object... currently always returning '<not-set>'
        // TODO: set variationKey to <not-set> if environment stored in overrides object !== user-selected environment
        const variationKey = overrides?._variation ?? '<not-set>'

        this.writer.showResults(`Override for feature: ${featureKey?.toLowerCase()} on environment: ${environmentKey?.toLowerCase()} is variation: ${variationKey}`) 
        this.writer.showResults(overrides) // displays an object with a single key, 'overrides', which is an array of Override objects: {_environment, _variation}
    }
}

// NOTE: ANY TEST CASE WHERE AN OVERRIDE SHOULD BE RETURNED SHOWS A VARIATIONKEY OF '<not-set>'
// test: headless no flags ✅
// test: headless and feature flag ✅
// test: headless and environment flag ✅
// test: headless and both flags ❌ only returns override for environment using overrides, environment flag is essentially ignored
// test: not headless, no flags ✅
// test: not headless, feature flag ✅
// test: not headless, environment flag ✅
// test: not headless, both flags ✅