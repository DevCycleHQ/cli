import { Flags } from '@oclif/core'
import inquirer from '../../ui/autocomplete'
import { 
    environmentPrompt, 
    EnvironmentPromptResult, 
    featurePrompt, 
    FeaturePromptResult 
} from '../../ui/prompts'
import Base from '../base'
import { Feature, Environment } from '../../api/schemas'
import { fetchOverrides } from '../../api/overrides'

type Params = {
    featureKey?: string,
    environment_id?: string,
    feature?: Feature,
    environment?: Environment
}
export default class DetailedTargeting extends Base {
    static hidden = false
    authRequired = true
    static description = 'Retrieve Targeting for a Feature from the Management API'
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
        const params: Params = {}

        if (!headless) {
            Object.keys(args).forEach((key) => {
                this.prompts = this.prompts.filter((prompt) => prompt.name !== key)
            })

            if (!feature && !environment) {
                const responses = await inquirer.prompt<FeaturePromptResult & EnvironmentPromptResult>(
                    this.prompts,
                    {
                        token: this.authToken,
                        projectKey: this.projectKey
                    }
                )
                Object.assign(params, {
                    feature: responses.feature,
                    featureKey: responses.feature.key,
                    environment_id: responses.environment?.key,
                    environment: responses.environment
                })
            }
        }

        if (headless && !feature && !environment) {
            this.writer.showError('Feature and environment arguments are required')
            return
        }

        const overrides = await fetchOverrides(this.authToken, this.projectKey, feature)
        this.writer.showResults(overrides)
    }
}