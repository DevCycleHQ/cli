import inquirer from 'inquirer'

import { Flags } from '@oclif/core'
import {
    deleteAllProjectOverrides,
    deleteFeatureOverrides,
    fetchProjectOverridesForUser,
} from '../../api/overrides'
import Base from '../base'
import { EnvironmentPromptResult, FeaturePromptResult } from '../../ui/prompts'
import {
    overridesEnvironmentPrompt,
    overridesFeaturePrompt,
} from '../../ui/prompts/overridePrompts'
import { fetchUserProfile } from '../../api/userProfile'

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
            description:
                'The key or id of the Feature to clear the Override for',
        }),
        environment: Flags.string({
            name: 'environment',
            description:
                'The key or id of the Environment to clear the Override for',
        }),
        ...Base.flags,
    }

    public async run(): Promise<void> {
        const { flags } = await this.parse(DeleteOverrides)
        const { headless, project, all } = flags

        let { feature: featureKey, environment: environmentKey } = flags
        let environment = null
        let feature = null
        await this.requireProject(project, headless)

        const identity = await fetchUserProfile(this.authToken, this.projectKey)
        if (!identity.dvcUserId) {
            this.writer.showError(
                'You must set your DevCycle Identity before you can update an Override',
            )
            this.writer.infoMessageWithCommand(
                'To set up your SDK Associated User ID, use',
                'dvc identity update',
            )
            return
        }

        const projectOverrides = await fetchProjectOverridesForUser(
            this.authToken,
            this.projectKey,
        )

        if (all) {
            if (!headless) {
                const { confirmClear } = await inquirer.prompt([
                    {
                        name: 'confirmClear',
                        message: `Are you sure you want to clear ALL Overrides for project: ${this.projectKey}?`,
                        type: 'confirm',
                    },
                ])
                if (!confirmClear) {
                    this.writer.warningMessage(
                        `No Overrides cleared for project: ${this.projectKey}`,
                    )
                    return
                }
            }

            await deleteAllProjectOverrides(this.authToken, this.projectKey)
            this.writer.successMessage(
                `Successfully cleared all overrides for project: ${this.projectKey}`,
            )
            return
        }

        if (projectOverrides.length === 0) {
            this.writer.showError(
                `No Overrides found for project: ${this.projectKey}`,
            )
            this.writer.infoMessageWithCommand(
                'To set up Overrides, use',
                'dvc overrides update',
            )
            return
        }

        if (!featureKey && !headless) {
            const featurePromptResult =
                await inquirer.prompt<FeaturePromptResult>(
                    [overridesFeaturePrompt],
                    {
                        token: this.authToken,
                        projectKey: this.projectKey,
                    },
                )
            featureKey = featurePromptResult.feature.key
            feature = featurePromptResult.feature
        }

        if (!environmentKey && !headless) {
            const { environment: environmentPromptResult } =
                await inquirer.prompt<EnvironmentPromptResult>(
                    [overridesEnvironmentPrompt],
                    {
                        token: this.authToken,
                        projectKey: this.projectKey,
                        featureKey: featureKey,
                    },
                )
            environmentKey = environmentPromptResult._id
            environment = environmentPromptResult
        }

        if (!featureKey || !environmentKey) {
            this.writer.showError(
                "Both the '--feature' and '--environment' flags or the '--all' flag must be provided to proceed.",
            )
            return
        }

        await deleteFeatureOverrides(
            this.authToken,
            this.projectKey,
            featureKey,
            environmentKey,
        )
        this.writer.successMessage(
            `Successfully cleared all overrides for the Feature '${feature?.name}'` +
                ` and Environment '${environment?.name}'`,
        )
    }
}
