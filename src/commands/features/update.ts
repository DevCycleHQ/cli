import { fetchFeatureByKey, updateFeature } from '../../api/features'
import {
    descriptionPrompt,
    featurePrompt,
    FeaturePromptResult,
    getSdkVisibilityPrompt,
    keyPrompt,
    namePrompt,
} from '../../ui/prompts'
import { Flags } from '@oclif/core'
import { UpdateFeatureDto } from '../../api/schemas'
import inquirer from '../../ui/autocomplete'
import { VariableListOptions } from '../../ui/prompts/listPrompts/variablesListPrompt'
import { VariationListOptions } from '../../ui/prompts/listPrompts/variationsListPrompt'
import UpdateCommandWithCommonProperties from '../updateCommandWithCommonProperties'

export default class UpdateFeature extends UpdateCommandWithCommonProperties {
    static hidden = false
    authRequired = true
    static description = 'Update a Feature.'
    static flags = {
        ...UpdateCommandWithCommonProperties.flags,
        variables: Flags.string({
            description: 'The variables to set for the feature',
        }),
        variations: Flags.string({
            description: 'The variations to set for the feature',
        }),
        sdkVisibility: Flags.string({
            description: 'The visibility of the feature for the SDKs',
        }),
        key: Flags.string({
            description: 'The unique key of the feature',
        }),
        description: Flags.string({
            description: 'A description of the feature',
        }),
    }

    prompts = [namePrompt, keyPrompt, descriptionPrompt]

    public async run(): Promise<void> {
        const { flags, args } = await this.parse(UpdateFeature)
        const {
            headless,
            key,
            name,
            description,
            variables,
            variations,
            sdkVisibility,
            project,
        } = flags
        await this.requireProject(project, headless)

        const featureKey = args.key
        let feature
        if (headless && !featureKey) {
            this.writer.showError('The key argument is required')
            return
        } else if (!featureKey) {
            const response = await inquirer.prompt<FeaturePromptResult>(
                [featurePrompt],
                {
                    token: this.authToken,
                    projectKey: this.projectKey,
                },
            )
            feature = response.feature
        } else {
            feature = await fetchFeatureByKey(
                this.authToken,
                this.projectKey,
                featureKey,
            )
            if (!feature) {
                this.writer.showError(
                    `Feature with key ${featureKey} could not be found`,
                )
                return
            }
        }

        this.writer.printCurrentValues(feature)

        const variableListOptions = new VariableListOptions(
            feature.variables ?? [],
            this.writer,
            !variations ? feature.variations : undefined, // don't prompt for variable values if variations flag provided
        )

        this.prompts.push(variableListOptions.getVariablesListPrompt())
        this.prompts.push(
            new VariationListOptions(
                feature.variations ?? [],
                variables ? JSON.parse(variables) : feature.variables,
                this.writer,
            ).getVariationListPrompt(),
        )
        this.prompts.push(getSdkVisibilityPrompt(feature))

        const params = await this.populateParametersWithZod(
            UpdateFeatureDto,
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
        const result = await updateFeature(
            this.authToken,
            this.projectKey,
            feature.key,
            params,
        )
        this.writer.showResults(result)
    }
}
