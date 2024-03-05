import { createFeature } from '../../api/features'
import {
    descriptionPrompt,
    getSdkVisibilityPrompt,
    keyPrompt,
    namePrompt,
} from '../../ui/prompts'
import CreateCommand from '../createCommand'
import { VariableListOptions } from '../../ui/prompts/listPrompts/variablesListPrompt'
import { Flags } from '@oclif/core'
import { CreateFeatureDto, Feature } from '../../api/schemas'
import { VariationListOptions } from '../../ui/prompts/listPrompts/variationsListPrompt'
import {
    mergeQuickFeatureParamsWithAnswers,
    setupTargetingForEnvironments,
} from '../../utils/features/quickCreateFeatureUtils'
import { fetchProject } from '../../api/projects'

export default class CreateFeature extends CreateCommand {
    static hidden = false
    authRequired = true
    static description = 'Create a new Feature.'
    static flags = {
        ...CreateCommand.flags,
        variables: Flags.string({
            description: 'The variables to create for the feature',
        }),
        variations: Flags.string({
            description: 'The variations to set for the feature',
        }),
        sdkVisibility: Flags.string({
            description: 'The visibility of the feature for the SDKs',
        }),
        interactive: Flags.boolean({
            char: 'i',
            description: 'Interactive Feature Creation Mode',
        }),
    }

    prompts = [namePrompt, keyPrompt, descriptionPrompt]

    public async run(): Promise<void> {
        const { flags } = await this.parse(CreateFeature)
        const {
            headless,
            key,
            name,
            description,
            variables,
            variations,
            sdkVisibility,
            project: projectFlag,
        } = flags
        await this.requireProject(projectFlag, headless)

        if (headless && (!key || !name)) {
            this.writer.showError('The key and name flags are required')
            return
        }

        if (!flags.interactive) {
            let params: Record<string, string> = flags
            if (!flags.headless) {
                params = (await this.populateParametersWithFlags(
                    this.prompts,
                    flags,
                )) as Record<string, string>
            }
            const featureParams = mergeQuickFeatureParamsWithAnswers(params)
            const feature = await createFeature(
                this.authToken,
                this.projectKey,
                featureParams,
            )
            await setupTargetingForEnvironments(
                this.authToken,
                this.projectKey,
                feature.key,
            )
            this.writer.showResults(feature)
            this.showSuggestedCommand(feature)
            return
        }

        this.prompts.push(
            new VariableListOptions([], this.writer).getVariablesListPrompt(),
        )
        this.prompts.push(
            new VariationListOptions(
                [],
                [],
                this.writer,
            ).getVariationListPrompt(),
        )

        const project = await fetchProject(this.authToken, this.projectKey)
        if (project.settings.sdkTypeVisibility.enabledInFeatureSettings) {
            this.prompts.push(getSdkVisibilityPrompt())
        }
        const params = await this.populateParametersWithZod(
            CreateFeatureDto,
            this.prompts,
            {
                key,
                name,
                description,
                ...(variables ? { variables: JSON.parse(variables) } : {}),
                ...(variations ? { variations: JSON.parse(variations) } : {}),
                ...(sdkVisibility
                    ? { sdkVisibility: JSON.parse(sdkVisibility) }
                    : {}),
                headless,
            },
        )

        const result = await createFeature(
            this.authToken,
            this.projectKey,
            params,
        )
        this.writer.showResults(result)
    }

    private showSuggestedCommand(feature: Feature) {
        const message =
            `\nFeature "${feature.name}" successfully created!\n` +
            '\nTo update the targeting rules, use: \n\n' +
            `    dvc targeting update ${feature.key}\n`

        this.writer.showRawResults(message)
    }
}
