import { Args } from '@oclif/core'
import inquirer from '../../ui/autocomplete'
import { fetchTargetingForFeature } from '../../api/targeting'
import { environmentPrompt, EnvironmentPromptResult, featurePrompt, FeaturePromptResult } from '../../ui/prompts'
import Base from '../base'

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

        const params = Object.assign({}, args)

        // TODO: this should use populateParameters once it's added to Base class
        if (!flags.headless && !params.feature) {
            Object.keys(args).forEach((key) => {
                this.prompts = this.prompts.filter((prompt) => prompt.name !== key)
            })

            const responses = await inquirer.prompt<FeaturePromptResult & EnvironmentPromptResult>(
                this.prompts,
                {
                    token: this.authToken,
                    projectKey: this.projectKey
                }
            ) as Record<string, any>
            Object.assign(params, {
                feature: responses.feature,
                environment: responses.environment?._id
            })
        }

        if (!params.feature) {
            this.writer.showError('Feature argument is required')
            return
        }

        const targeting = await fetchTargetingForFeature(
            this.authToken,
            this.projectKey,
            params.feature,
            params.environment
        )
        return this.writer.showResults(targeting)
    }
}
