import inquirer from 'inquirer'
import { fetchVariations } from '../../api/variations'
import { featurePrompt } from '../../ui/prompts'
import Base from '../base'
import { Args } from '@oclif/core'

export default class GetVariations extends Base {
    static hidden = false
    authRequired = true

    static args = {
        feature: Args.string({
            name: 'feature',
            description: 'Feature key or id'
        })
    }

    public async run(): Promise<void> {
        await this.requireProject()
        const { args } = await this.parse(GetVariations)

        let featureKey
        if (!args.feature) {
            const { _feature } = await inquirer.prompt([featurePrompt], {
                token: this.authToken,
                projectKey: this.projectKey
            })

            featureKey = _feature
        } else {
            featureKey = args.feature
        }

        const variations = await fetchVariations(this.authToken, this.projectKey, featureKey)
        this.writer.showResults(variations)
    }
}
