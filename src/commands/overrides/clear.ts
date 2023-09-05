import inquirer from 'inquirer'

import { Flags } from '@oclif/core'
import { deleteAllProjectOverrides, deleteFeatureOverrides } from '../../api/overrides'
import Base from '../base'
import { FeaturePromptResult, featurePrompt, EnvironmentPromptResult, environmentPrompt } from '../../ui/prompts'

export default class DeleteOverrides extends Base {
    static hidden = false
    authRequired = true
    static description = 'Clear Overrides for a given Feature or Project.'

    prompts = []

    static args = {}

    static flags = {
        all: Flags.boolean({
            name: 'all',
            description: 'All Overrides for the Project',
            allowNo: false,
        }),
        feature: Flags.string({
            name: 'feature',
            description: 'The key or id of the Feature to clear the Override for',
        }),
        environment: Flags.string({
            name: 'environment',
            description: 'The key or id of the Environment to clear the Override for',
        }),
        ...Base.flags,
    }

    public async run(): Promise<void> {

        const { flags } = await this.parse(DeleteOverrides)
        const { headless, project, all, feature, environment } = flags

        await this.requireProject(project, headless)

        if (all) {
            if (!headless) {
                const { confirmClear } = await inquirer.prompt([{
                    name: 'confirmClear',
                    message: `Are you sure you want to clear ALL Overrides for project: ${this.projectKey}?`,
                    type: 'confirm'
                }])
                if (!confirmClear) {
                    this.writer.warningMessage(`No Overrides cleared for project: ${this.projectKey}`)
                    return
                }
            }

            await deleteAllProjectOverrides(this.authToken, this.projectKey)
            this.writer.successMessage(
                `Successfully cleared all overrides for project: ${this.projectKey}`
            )
            return
        }

        let featureKey = feature
        if (!feature && !headless) {
            const featurePromptResult = await inquirer.prompt<FeaturePromptResult>([featurePrompt], {
                token: this.authToken,
                projectKey: this.projectKey
            })
            featureKey = featurePromptResult.feature.key
        }

        let environmentKey = environment
        if (!environment && !headless) {
            const { environment: environmentPromptResult } = await inquirer.prompt<EnvironmentPromptResult>(
                [environmentPrompt], {
                    token: this.authToken,
                    projectKey: this.projectKey
                })
            environmentKey = environmentPromptResult._id
        }

        if (!featureKey || !environmentKey) {
            this.writer.showError(
                'Both the \'--feature\' and \'--environment\' flags or the \'--all\' flag must be provided to proceed.'
            )
            return
        }
                
        await deleteFeatureOverrides(
            this.authToken,
            this.projectKey,
            featureKey,
            environmentKey
        )
        this.writer.successMessage(
            `Successfully cleared all overrides for the Feature '${featureKey}'`
                    + ` and Environment '${environmentKey}'`
        )
    }
}
