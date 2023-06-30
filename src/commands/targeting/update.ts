import { Args, Flags } from '@oclif/core'
import { EnvironmentPromptResult, FeaturePromptResult, environmentPrompt, featurePrompt } from '../../ui/prompts'
import inquirer from '../../ui/autocomplete'
import {
    UpdateTargetingParamsInput,
    fetchTargetingForFeature,
    updateFeatureConfigForEnvironment
} from '../../api/targeting'
import { TargetingListOptions } from '../../ui/prompts/listPrompts/targetingListPrompt'
import { FeatureConfig, UpdateTargetParams } from '../../api/schemas'
import Base from '../base'
import { validateSync } from 'class-validator'
import { plainToClass } from 'class-transformer'
import { reportValidationErrors } from '../../utils/reportValidationErrors'

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
        const { feature, environment } = args
        const { targets, headless } = flags

        await this.requireProject()

        if (headless && (!feature || !environment)) {
            this.writer.showError('Feature and environment arguments are required')
            return
        }

        let featureKey = feature
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

        let envKey = environment
        if (!envKey) {
            const environment = await inquirer.prompt<EnvironmentPromptResult>(
                [environmentPrompt],
                {
                    token: this.authToken,
                    projectKey: this.projectKey
                }
            )
            envKey = environment.environment.key
        }

        if (targets) {
            const parsedTargets = JSON.parse(targets)
            const featureTargets = []
            for (const t of parsedTargets) {
                const target = plainToClass(UpdateTargetingParamsInput, t)
                const errors = validateSync(target)
                reportValidationErrors(errors)
                const { name, serve: variation, definition } = target
                featureTargets.push({
                    distribution: [{ _variation: variation, percentage: 1 }],
                    audience: { name, filters: { filters: definition, operator: 'and' as const } }
                })
            }
            const featureConfig = {
                targets: featureTargets
            }

            const result = await updateFeatureConfigForEnvironment(
                this.authToken,
                this.projectKey,
                featureKey,
                envKey,
                featureConfig
            )
            this.writer.showResults(result)
            return
        }

        const featureTargetingRules: FeatureConfig = (await fetchTargetingForFeature(
            this.authToken, this.projectKey, featureKey, envKey
        ))[0]
        const targetingRules: UpdateTargetParams[] =
            await (
                new TargetingListOptions(
                    featureTargetingRules.targets, this.writer, this.authToken, this.projectKey, featureKey
                )
            ).prompt()
        const featureConfig = {
            targets: targetingRules
        }

        const result = await updateFeatureConfigForEnvironment(
            this.authToken,
            this.projectKey,
            featureKey,
            envKey,
            featureConfig
        )
        this.writer.showResults(result)
        this.showSuggestedCommand(featureKey, envKey, result)
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
