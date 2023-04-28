import { Flags } from '@oclif/core'
import {
    getFeatureConfigurations,
    ListTargetingRuleParams,
    toggleTargetingRule,
} from '../../api/featureConfigs'
import { fetchFeatureByKey } from '../../api/features'
import { promptForTargetStatus } from '../../ui/promptForTargetStatus'
import { featureKeyPrompt, environmentKeyPrompt } from '../../ui/prompts'
import CreateCommand from '../createCommand'

export default class ToggleTargetingRule extends CreateCommand<ListTargetingRuleParams> {
    static hidden = false
    static description = 'Create a new Environment for an existing Feature.'

    static flags = {
        ...CreateCommand.flags,
        featureKey: Flags.string({
            description: 'feature key for the targeting rule to create for',
        }),
        environmentKey: Flags.string({
            description: 'environment key for the targeting rule to create for',
        }),
        on: Flags.boolean({
            description: 'toggle on the targeting rule',
        }),
        off: Flags.boolean({
            description: 'toggle off the targeting rule',
        }),
    }

    public async run(): Promise<void> {
        const { flags } = await this.parse(ToggleTargetingRule)

        await this.requireProject()

        let status: 'active' | 'inactive' | 'archived' | null = null

        if (Object.values(flags).some((flag) => flag !== undefined)) {
            if (flags.on && flags.off) {
                this.writer.showResults(
                    'Cannot toggle on and off at the same time',
                )
                return
            }
            if (!flags.featureKey) {
                this.writer.showResults('No feature key provided')
                return
            }
            if (!flags.environmentKey) {
                this.writer.showResults('No environment key provided')
                return
            }

            flags.on ? (status = 'active') : (status = null)
            flags.off ? (status = 'inactive') : (status = null)

            if (!flags.on && !flags.off) {
                const status = await promptForTargetStatus()
                if (status === 'active') {
                    flags.on = true
                }
                if (status === 'inactive') {
                    flags.off = true
                }
            }
            const featureObj = await fetchFeatureByKey(
                this.token,
                this.projectKey,
                flags.featureKey,
            )
            const updatedRule = await toggleTargetingRule(
                this.token,
                this.projectKey,
                flags.featureKey,
                flags.environmentKey,
                flags.on ? 'active' : 'inactive',
            )

            if (updatedRule === null) {
                this.writer.showResults('No targeting rules found')
                return
            }
            if (updatedRule.status === 'inactive') {
                this.writer.failureMessage('Rule toggled off')
            }
            if (updatedRule.status === 'active') {
                this.writer.successMessage('Rule toggled on')
            }
            if (updatedRule.status === 'archived') {
                this.writer.warningMessage('Archived rule')
            }
            for (const target of updatedRule.targets) {
                const variationList: string[] = []
                for (const distribution of target.distribution) {
                    const variation = featureObj?.variations.find(
                        (variation) =>
                            variation._id === distribution._variation,
                    )
                    variationList.push(variation?.key || 'unknown')
                }
                this.writer.showResults(
                    `Targeting rule: ${
                        target.audience.name
                    } Variation: ${variationList.toString()}`,
                )
            }
            return
        }
        this.prompts = [featureKeyPrompt, environmentKeyPrompt]

        const params = await this.populateParameters(ListTargetingRuleParams)
        status = await promptForTargetStatus()

        if (status === null) {
            this.writer.showResults('Could not get the status')
            return
        }
        const updatedRule = await toggleTargetingRule(
            this.token,
            this.projectKey,
            params.feature,
            params.environment,
            status,
        )

        if (updatedRule === null) {
            this.writer.showResults('No targeting rules found')
            return
        }
        if (updatedRule.status === 'inactive') {
            this.writer.failureMessage('Rule toggled off')
        }
        if (updatedRule.status === 'active') {
            this.writer.successMessage('Rule toggled on')
        }
        if (updatedRule.status === 'archived') {
            this.writer.warningMessage('Archived rule')
        }

        const featureObj = await fetchFeatureByKey(
            this.token,
            this.projectKey,
            params.feature,
        )

        for (const target of updatedRule.targets) {
            const variationList: string[] = []
            for (const distribution of target.distribution) {
                const variation = featureObj?.variations.find(
                    (variation) => variation._id === distribution._variation,
                )
                variationList.push(variation?.key || 'unknown')
            }
            this.writer.showResults(
                `Targeting rule: ${
                    target.audience.name
                } Variation: ${variationList.toString()}`,
            )
        }
    }
    // }
}
