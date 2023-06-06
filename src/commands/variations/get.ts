import inquirer from 'inquirer'
import { fetchVariations } from '../../api/variations'
import { featurePrompt } from '../../ui/prompts'
import Base from '../base'

export default class GetVariations extends Base {
    static hidden = false
    authRequired = true

    static args = [
        {
            name: 'feature',
            description: 'Feature key or id'
        }
    ]

    public async run(): Promise<void> {
        await this.requireProject()
        const { args } = await this.parse(GetVariations)

        let featureKey = args.feature
        if (!args.feature) {
            const { _feature } = await inquirer.prompt([featurePrompt], {
                token: this.token,
                projectKey: this.projectKey
            })

            featureKey = _feature
        }

        const variations = await fetchVariations(this.token, this.projectKey, featureKey)
        this.writer.showResults(variations)
    }
}
