import { Args } from '@oclif/core'
import { deleteFeature } from '../../api/features'
import Base from '../base'
import inquirer from 'inquirer'
import { featurePrompt } from '../../ui/prompts'

export default class DeleteFeatures extends Base {
    static hidden = false
    authRequired = true

    static args = {
        feature: Args.string({
            name: 'feature',
            description: 'Feature key or id to delete'
        })
    }

    public async run(): Promise<void> {
        await this.requireProject()

        const { args } = await this.parse(DeleteFeatures)

        let featureKey
        if (!args.feature) {
            const { feature  } = await inquirer.prompt([featurePrompt], {
                token: this.authToken,
                projectKey: this.projectKey
            })
            featureKey = feature
        } else {
            featureKey = args.feature
        }

        await deleteFeature(this.authToken, this.projectKey, featureKey)
        this.writer.successMessage('Feature successfully deleted')
    }
}
