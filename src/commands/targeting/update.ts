import { Args, Flags } from '@oclif/core'
import {
    EnvironmentPromptResult,
    FeaturePromptResult,
    Prompt,
    environmentPrompt,
    featurePrompt,
} from '../../ui/prompts'
import inquirer from '../../ui/autocomplete'
import {
    fetchTargetingForFeature,
    updateFeatureConfigForEnvironment,
} from '../../api/targeting'
import { TargetingListOptions } from '../../ui/prompts/listPrompts/targetingListPrompt'
import { reportZodValidationErrors } from '../../utils/reportValidationErrors'
import { renderTargetingTree } from '../../ui/targetingTree'
import { fetchEnvironmentByKey } from '../../api/environments'
import { fetchVariations } from '../../api/variations'
import { FeatureConfig, UpdateFeatureConfigDto, Filter } from '../../api/schemas'
import { z } from 'zod'
import { targetingStatusPrompt } from '../../ui/prompts/targetingPrompts'

// Custom input schema for targeting update command
const UpdateTargetingParamsInput = z.object({
    name: z.string(),
    serve: z.string().optional(),
    definition: z.array(z.any()).optional(),
})
import UpdateCommand from '../updateCommand'
import { fetchAudiences } from '../../api/audiences'
import { createTargetAndEnable } from '../../utils/targeting'

export default class UpdateTargeting extends UpdateCommand {
    static hidden = false
    // eslint-disable-next-line max-len
    static description =
        'Update Targeting rules for a Feature. The definition is the audience for the feature, while serve is the key of the variation to serve to the audience.'
    authRequired = true
    static args = {
        feature: Args.string({
            description: 'The Feature for the Targeting Rule.',
        }),
        environment: Args.string({
            description:
                'The Environment where the Targeting Rule will be updated.',
        }),
    }

    static flags = {
        ...UpdateCommand.flags,
        targets: Flags.string({
            description: 'List of targeting rules.',
        }),
        status: Flags.string({
            description: 'The status to set the targeting rule to.',
            options: ['enable', 'disable'],
        }),
    }

    prompts: Prompt[] = [targetingStatusPrompt]

    public async run(): Promise<void> {
        const { args, flags } = await this.parse(UpdateTargeting)
        const { project, headless } = flags
        await this.requireProject(project, headless)

        if (flags.headless && (!args.feature || !args.environment)) {
            this.writer.showError(
                'Feature and environment arguments are required',
            )
            return
        }

        let featureKey = args.feature
        if (!featureKey) {
            const promptResult = await inquirer.prompt<FeaturePromptResult>(
                [featurePrompt],
                {
                    token: this.authToken,
                    projectKey: this.projectKey,
                },
            )
            featureKey = promptResult.feature.key as string
        }

        let envKey = args.environment
        if (!envKey) {
            const promptResult = await inquirer.prompt<EnvironmentPromptResult>(
                [environmentPrompt],
                {
                    token: this.authToken,
                    projectKey: this.projectKey,
                },
            )
            envKey = promptResult.environment.key
        }

        const environment = await fetchEnvironmentByKey(
            this.authToken,
            this.projectKey,
            envKey,
        )
        const variations = await fetchVariations(
            this.authToken,
            this.projectKey,
            featureKey,
        )
        const audiences = await fetchAudiences(this.authToken, this.projectKey)

        const status = this.convertStatusFlagValue(flags.status)
        let targets: UpdateFeatureConfigDto['targets']
        if (flags.targets) {
            targets = []
            const parsedTargets = JSON.parse(flags.targets)

            for (const t of parsedTargets) {
                const validationResult = UpdateTargetingParamsInput.safeParse(t)
                if (!validationResult.success) {
                    reportZodValidationErrors(validationResult.error, this.writer)
                    return
                }
                const { name, serve: variation, definition } = validationResult.data
                if (!variation) {
                    this.writer.showError('serve field is required')
                    return
                }
                if (!definition) {
                    this.writer.showError('definition field is required')
                    return
                }
                targets.push({
                    distribution: [{ _variation: variation, percentage: 1 }],
                    audience: {
                        name,
                        filters: {
                            filters: definition as Filter[],
                            operator: 'and' as const,
                        },
                    },
                })
            }
        }

        // Only fetch targeting rules if not in headless mode and user didn't pass in a list of targeting rules
        let featureTargetingRules
        if (!headless && !flags.targets) {
            const [targetingRules] = await fetchTargetingForFeature(
                this.authToken,
                this.projectKey,
                featureKey,
                envKey,
            )
            featureTargetingRules = targetingRules
            const targetingListPrompt = new TargetingListOptions(
                featureTargetingRules.targets,
                audiences,
                this.writer,
                this.authToken,
                this.projectKey,
                featureKey,
            )
            targetingListPrompt.variations = variations
            this.prompts.push(targetingListPrompt.getTargetingListPrompt())
        }

        const params = await this.populateParametersWithZod(
            UpdateFeatureConfigDto,
            this.prompts,
            {
                status,
                targets,
                headless,
            },
        )

        if (
            !headless &&
            params.status === 'active' &&
            !params.targets && // user is setting status active without changing targets
            featureTargetingRules?.targets.length === 0 // no targeting rules (ie. the status update will fail)
        ) {
            await createTargetAndEnable(
                featureTargetingRules.targets,
                featureKey,
                environment.key,
                this.authToken,
                this.projectKey,
                this.writer,
                variations,
                environment,
            )
            return
        }

        const result = await updateFeatureConfigForEnvironment(
            this.authToken,
            this.projectKey,
            featureKey,
            envKey,
            params,
        )

        if (flags.headless) {
            this.writer.showResults(result)
        } else {
            renderTargetingTree(
                [result],
                environment ? [environment] : [],
                variations,
                audiences,
            )
            this.showSuggestedCommand(featureKey, envKey, result)
        }
    }

    private showSuggestedCommand(
        featureKey: string,
        envKey: string,
        result: FeatureConfig,
    ) {
        const { status, targets } = result
        if (status === 'active' || targets.length === 0) {
            return
        }
        const message =
            '\nTo enable this feature on this environment, use:\n\n' +
            `    dvc targeting enable ${featureKey} ${envKey}\n`

        this.writer.showRawResults(message)
    }

    private convertStatusFlagValue(status?: string) {
        if (status === undefined) {
            return undefined
        }
        return status === 'enable' ? 'active' : 'inactive'
    }
}
