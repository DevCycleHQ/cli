import inquirer from 'inquirer'
import { fetchVariations } from '../../api/variations'
import { featurePrompt, FeaturePromptResult } from '../../ui/prompts'
import Base from '../base'
import { Args } from '@oclif/core'

export default class GetVariations extends Base {
    static hidden = false
    authRequired = true
    static description = 'Retrieve variations for a feature from the management API'

    static args = {
        feature: Args.string({
            name: 'feature',
            description: 'Feature key or id'
        })
    }

    public async run(): Promise<void> {
        await this.requireProject()
        const { args, flags } = await this.parse(GetVariations)
        const { headless } = flags
        let featureKey
        if (headless && !args.feature) {
            this.writer.showError('In headless mode, feature is required')
            return
        } else if (!args.feature) {
            const { feature } = await inquirer.prompt<FeaturePromptResult>([featurePrompt], {
                token: this.authToken,
                projectKey: this.projectKey
            })

            featureKey = feature.key
        } else {
            featureKey = args.feature
        }

        const variations = await fetchVariations(this.authToken, this.projectKey, featureKey)
        this.writer.showResults(variations)
    }
}
