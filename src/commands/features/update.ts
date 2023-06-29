import { fetchFeatures, updateFeature } from '../../api/features'
import {
    descriptionPrompt,
    featurePrompt,
    getSdkVisibilityPrompt,
    keyPrompt,
    namePrompt,
} from '../../ui/prompts'
import UpdateCommand from '../updateCommand'
import { Flags } from '@oclif/core'
import { UpdateFeatureDto } from '../../api/schemas'
import inquirer from '../../ui/autocomplete'
import { VariableListOptions } from '../../ui/prompts/listPrompts/variablesListPrompt'
import { VariationListOptions } from '../../ui/prompts/listPrompts/variationsListPrompt'

export default class UpdateFeature extends UpdateCommand {
    static hidden = false
    authRequired = true
    static description = 'Update a Feature.'
    static flags = {
        ...UpdateCommand.flags,
        variables: Flags.string({
            description: 'The variables to set for the feature'
        }),
        variations: Flags.string({
            description: 'The variations to set for the feature'
        }),
        sdkVisibility: Flags.string({
            description: 'The visibility of the feature for the SDKs'
        }),
        key: Flags.string({
            description: 'The unique key of the feature'
        }),
        description: Flags.string({
            description: 'A description of the feature'
        }),
    }

    prompts = [keyPrompt, namePrompt, descriptionPrompt]

    public async run(): Promise<void> {
        if (this.checkAuthExpired()) {
            return
        }
        const { flags, args } = await this.parse(UpdateFeature)
        const { headless, key, name, description, variables, variations, sdkVisibility } = flags
        await this.requireProject()

        let featureKey = args.key
        if (headless && !featureKey) {
            this.writer.showError('The key argument is required')
            return
        } else if (!featureKey) {
            const response = await inquirer.prompt([featurePrompt], {
                token: this.authToken,
                projectKey: this.projectKey
            })
            featureKey = response.feature
        }
        const features = await fetchFeatures(this.authToken, this.projectKey)
        const feature = features.find((f) => f._id === featureKey || f.key === featureKey)

        if (!feature) {
            this.writer.showError(`Feature with key ${featureKey} could not be found`)
            return
        }

        this.writer.blankLine()
        this.writer.statusMessage('Current values:')
        this.writer.statusMessage(JSON.stringify(feature, null, 2))
        this.writer.blankLine()

        this.prompts.push((new VariableListOptions([], this.writer)).getVariablesListPrompt(feature.variables))
        this.prompts.push((new VariationListOptions([], this.writer))
            .getVariationListPrompt( // if variables flags were passed in, treat those as the new variables
                feature.variations,
                variables ? JSON.parse(variables): feature.variables,
            )
        )
        this.prompts.push(getSdkVisibilityPrompt(feature))

        const params = await this.populateParametersWithZod(UpdateFeatureDto, this.prompts, {
            key,
            name,
            description,
            ...(variables ? { variables: JSON.parse(variables) } : {}),
            ...(variations ? { variations: JSON.parse(variations) } : {}),
            ...(sdkVisibility ? { sdkVisibility: JSON.parse(sdkVisibility) } : {}),
            headless,
        })

        const result = await updateFeature(this.authToken, this.projectKey, feature.key, params)
        this.writer.showResults(result)
    }
}
