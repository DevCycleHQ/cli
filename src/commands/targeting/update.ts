import { Args, Flags } from '@oclif/core'
import { EnvironmentPromptResult, FeaturePromptResult, environmentPrompt, featurePrompt } from '../../ui/prompts'
import inquirer from '../../ui/autocomplete'
import {
    UpdateTargetingParamsInput,
    fetchTargetingForFeature,
    updateFeatureConfigForEnvironment
} from '../../api/targeting'
import { TargetingListOptions } from '../../ui/prompts/listPrompts/targetingListPrompt'
import Base from '../base'
import { validateSync } from 'class-validator'
import { plainToClass } from 'class-transformer'
import { reportValidationErrors } from '../../utils/reportValidationErrors'
import { renderTargetingTree } from '../../ui/targetingTree'
import { fetchEnvironmentByKey } from '../../api/environments'
import { fetchVariations } from '../../api/variations'
import { FeatureConfig } from '../../api/schemas'

export default class UpdateTargeting extends Base {
    static hidden = false
    static description = 'Update Targeting rules'
    authRequired = true
    static args = {
        feature: Args.string({
            description: 'The Feature for the Targeting Rule.'
        }),
        environment: Args.string({
            description: 'The Environment where the Targeting Rule will be updated.'
        }),
    }

    static flags = {
        ...Base.flags,
        targets: Flags.string({
            description: 'List of targeting rules.'
        }),
    }

    public async run(): Promise<void> {
        const { args, flags } = await this.parse(UpdateTargeting)

        await this.requireProject()

        if (flags.headless && (!args.feature || !args.environment)) {
            this.writer.showError('Feature and environment arguments are required')
            return
        }

        let featureKey = args.feature
        if (!featureKey) {
            const promptResult = await inquirer.prompt<FeaturePromptResult>(
                [featurePrompt],
                {
                    token: this.authToken,
                    projectKey: this.projectKey
                }
            )
            featureKey = promptResult.feature
        }

        let envKey = args.environment
        if (!envKey) {
            const promptResult = await inquirer.prompt<EnvironmentPromptResult>(
                [environmentPrompt],
                {
                    token: this.authToken,
                    projectKey: this.projectKey
                }
            )
            envKey = promptResult.environment.key
        }

        const environment = await fetchEnvironmentByKey(this.authToken, this.projectKey, envKey)
        const variations = await fetchVariations(this.authToken, this.projectKey, featureKey)

        let targets = []
        if (flags.targets) {
            const parsedTargets = JSON.parse(flags.targets)

            for (const t of parsedTargets) {
                const target = plainToClass(UpdateTargetingParamsInput, t)
                const errors = validateSync(target)
                reportValidationErrors(errors)
                const { name, serve: variation, definition } = target
                targets.push({
                    distribution: [{ _variation: variation, percentage: 1 }],
                    audience: { name, filters: { filters: definition, operator: 'and' as const } }
                })
            }
        } else {
            const [featureTargetingRules] = await fetchTargetingForFeature(
                this.authToken, this.projectKey, featureKey, envKey
            )
            const targetingListPrompt = new TargetingListOptions(
                featureTargetingRules.targets, this.writer, this.authToken, this.projectKey, featureKey
            )
            targetingListPrompt.variations = variations
            targets = await targetingListPrompt.prompt()
        }

        const result = await updateFeatureConfigForEnvironment(
            this.authToken,
            this.projectKey,
            featureKey,
            envKey,
            { targets }
        )

        if (flags.headless) {
            this.writer.showResults(result)
        } else {
            renderTargetingTree(
                [result],
                environment ? [environment] : [],
                variations
            )
            this.showSuggestedCommand(featureKey, envKey, result)
        }
    }

    private showSuggestedCommand(featureKey: string, envKey: string, result: FeatureConfig) {
        const { status, targets } = result
        if (status === 'active' || targets.length === 0)  {
            return
        }
        const message = '\nTo enable this feature on this environment, use:\n\n' +
            `    dvc targeting enable ${featureKey} ${envKey}\n`

        this.writer.showRawResults(message)
    }
}
