import inquirer from 'inquirer'
import { fetchVariations } from '../../api/variations'
import { featurePrompt } from '../../ui/prompts'
import Base from '../base'
import { Args } from '@oclif/core'

export default class ListVariations extends Base {
    static hidden = false
    authRequired = true
    static description = 'List the keys of all variations in a feature'

    static args = {
        feature: Args.string({
            name: 'feature',
            description: 'Feature key or id'
        })
    }

    public async run(): Promise<void> {
        if (this.checkAuthExpired()) {
            return
        }
        await this.requireProject()
        const { args, flags } = await this.parse(ListVariations)
        const { headless } = flags
        let featureKey
        if (headless && !args.feature) {
            this.writer.showError('In headless mode, feature is required')
            return
        } else if (!args.feature) {
            const { feature } = await inquirer.prompt([featurePrompt], {
                token: this.authToken,
                projectKey: this.projectKey
            })

            featureKey = feature
        } else {
            featureKey = args.feature
        }

        const variations = await fetchVariations(this.authToken, this.projectKey, featureKey)
        const variationKeys = variations.map((variation) => variation.key)
        this.writer.showResults(variationKeys)
    }
}
