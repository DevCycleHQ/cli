import { Args } from '@oclif/core'
import { deleteFeature } from '../../api/features'
import Base from '../base'
import inquirer from 'inquirer'
import { featurePrompt, FeaturePromptResult, getStringMatchConfirmationPrompt } from '../../ui/prompts'

export default class DeleteFeatures extends Base {
    static hidden = false
    static description = 'Delete a feature'
    authRequired = true

    static args = {
        feature: Args.string({
            name: 'feature',
            description: 'Feature key or id to delete'
        })
    }

    public async run(): Promise<void> {
        const { args, flags } = await this.parse(DeleteFeatures)
        const { headless, project } = flags
        await this.requireProject(project, headless)
        let featureKey
        if (!args.feature) {
            const { feature } = await inquirer.prompt<FeaturePromptResult>([featurePrompt], {
                token: this.authToken,
                projectKey: this.projectKey
            })
            featureKey = feature.key
        } else {
            featureKey = args.feature
        }

        if (!headless) {
            const { confirm } = 
                await inquirer.prompt<{ confirm: string }>([getStringMatchConfirmationPrompt(featureKey)])
            if (confirm === featureKey) {
                await deleteFeature(this.authToken, this.projectKey, featureKey)
                this.writer.successMessage('Feature successfully deleted')
            }
            return
        }
        await deleteFeature(this.authToken, this.projectKey, featureKey)
        this.writer.successMessage('Feature successfully deleted')
    }
}
