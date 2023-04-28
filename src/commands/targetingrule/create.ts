import { Flags } from '@oclif/core'
import {
    addAllUserRule,
    CreateTargetingRuleParams,
} from '../../api/featureConfigs'
import { fetchFeatureByKey } from '../../api/features'
import { promptForVariation } from '../../ui/promptForVariation'

import { featureKeyPrompt, environmentKeyPrompt } from '../../ui/prompts'
import CreateCommand from '../createCommand'

export default class createTargetingRule extends CreateCommand<CreateTargetingRuleParams> {
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
        variationKey: Flags.string({
            description: 'variation key for the targeting rule to create for',
        }),
    }

    prompts = [featureKeyPrompt, environmentKeyPrompt]

    public async run(): Promise<void> {
        const { flags } = await this.parse(createTargetingRule)

        await this.requireProject()
        if (Object.values(flags).some((flag) => flag !== undefined)) {
            if (!flags.featureKey) {
                this.writer.showResults('No feature key provided')
                return
            }
            const featureObj = await fetchFeatureByKey(
                this.token,
                this.projectKey,
                flags.featureKey,
            )
            if (featureObj === null) {
                this.writer.showResults('No feature found')
                return
            }
            const variation = featureObj?.variations.find(
                (variation) => variation.key === flags.variationKey,
            )

            if (!variation || variation?._id === undefined) {
                this.writer.showResults('No variation found')
                return
            }

            const flagParams: CreateTargetingRuleParams = {
                feature: flags.featureKey || '',
                environment: flags.environmentKey || '',
            }
            const result = await addAllUserRule(
                this.token,
                this.projectKey,
                flagParams.feature,
                flagParams.environment,
                variation._id,
            )
            this.writer.showResults(result)
            return
        }

        const params = await this.populateParameters(CreateTargetingRuleParams)
        const featureObj = await fetchFeatureByKey(
            this.token,
            this.projectKey,
            params.feature,
        )
        const variation = await promptForVariation(featureObj?.variations || [])
        const result = await addAllUserRule(
            this.token,
            this.projectKey,
            params.feature,
            params.environment,
            variation,
        )
        this.writer.showResults(result)
    }
}
