import { Args } from '@oclif/core'
import inquirer from '../../ui/autocomplete'
import { fetchEnvironments } from '../../api/environments'
import { fetchVariations } from '../../api/variations'
import { fetchTargetingForFeature } from '../../api/targeting'
import { environmentPrompt, EnvironmentPromptResult, featurePrompt, FeaturePromptResult } from '../../ui/prompts'
import { renderTargetingTree } from '../../ui/targetingTree'
import Base from '../base'
import { Feature, Environment } from '../../api/schemas'

type Params = {
    featureKey?: string,
    environment_id?: string,
    feature?: Feature,
    environment?: Environment
}
export default class DetailedTargeting extends Base {
    static hidden = false
    static description = 'Retrieve Targeting for a Feature from the Management API'
    static examples = [
        '<%= config.bin %> <%= command.id %> feature-one',
        '<%= config.bin %> <%= command.id %> feature-one environment-one',
    ]
    static flags = Base.flags
    static args = {
        feature: Args.string({ description: 'The Feature to get the Targeting Rules' }),
        environment: Args.string({ description: 'The Environment to get the Targeting Rules', required: false })
    }

    authRequired = true
    prompts = [
        featurePrompt,
        environmentPrompt
    ]

    public async run(): Promise<void> {
        const { args, flags } = await this.parse(DetailedTargeting)

        await this.requireProject()

        const params: Params = {
            featureKey: args.feature,
            environment_id: args.environment
        }

        // TODO: this should use populateParameters once it's added to Base class
        if (!flags.headless && !params.featureKey) {
            Object.keys(args).forEach((key) => {
                this.prompts = this.prompts.filter((prompt) => prompt.name !== key)
            })

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

        if (!params.featureKey) {
            this.writer.showError('Feature argument is required')
            return
        }

        const targeting = await fetchTargetingForFeature(
            this.authToken,
            this.projectKey,
            params.featureKey,
            params.environment_id
        )

        if (flags.headless) {
            this.writer.showResults(targeting)
        } else {
            const environments = params.environment ?
                [params.environment] : await fetchEnvironments(this.authToken, this.projectKey)
            const variations = params.feature?.variations
                || await fetchVariations(this.authToken, this.projectKey, params.featureKey)
            renderTargetingTree(targeting, environments, variations)
        }
    }
}
