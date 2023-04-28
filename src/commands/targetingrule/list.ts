import {
    getFeatureConfigurations,
    ListTargetingRuleParams,
} from '../../api/featureConfigs'
import { fetchFeatureByKey } from '../../api/features'
import { featureKeyPrompt, environmentKeyPrompt } from '../../ui/prompts'
import CreateCommand from '../createCommand'

export default class listTargetingRule extends CreateCommand<ListTargetingRuleParams> {
    static hidden = false
    static description = 'Create a new Environment for an existing Feature.'

    prompts = [featureKeyPrompt, environmentKeyPrompt]

    public async run(): Promise<void> {
        await this.requireProject()
        const params = await this.populateParameters(ListTargetingRuleParams)
        const result = await getFeatureConfigurations(
            this.token,
            this.projectKey,
            params.feature,
            params.environment,
        )
        const featureObj = await fetchFeatureByKey(
            this.token,
            this.projectKey,
            params.feature,
        )

        if (result === null) {
            this.writer.showResults('No targeting rules found')
            return
        }
        if (featureObj === null) {
            this.writer.showResults('No feature found')
            return
        }

        // for (const rule of result) {
        // result.forEach(async (rule) => {
        if (result.status === 'inactive') {
            this.writer.failureMessage('Inactive rule')
        }
        if (result.status === 'active') {
            this.writer.successMessage('Active rule')
        }
        if (result.status === 'archived') {
            this.writer.warningMessage('Archived rule')
        }
        for (const target of result.targets) {
            // rule.targets.forEach(async (target) => {
            const variationList: string[] = []
            for (const distribution of target.distribution) {
                // target.distribution.forEach(async (distribution) => {
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
