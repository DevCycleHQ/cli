import { Flags } from '@oclif/core'
import {
    createVariable,
} from '../../api/variables'
import CreateCommand from '../createCommand'
import { createVariablePrompts, featurePrompt } from '../../ui/prompts'
import {CreateVariableDto, UpdateFeatureDto, Variable} from '../../api/schemas'
import inquirer from '../../ui/autocomplete'
import { VariableListOptions } from "../../ui/prompts/listPrompts/variablesListPrompt"
import {updateFeature} from "../../api/features";

export default class CreateVariable extends CreateCommand {
    static hidden = false
    static description = 'Create a new Variable for an existing Feature.'

    static flags = {
        ...CreateCommand.flags,
        'type': Flags.string({
            description: 'The type of variable',
            options: CreateVariableDto.shape.type.options
        }),
        'feature': Flags.string({
            description: 'The key or id of the feature to create the variable for'
        }),
        'variations': Flags.string({
            description: 'Set a value for this variable in each variation of the associated feature'
        }),
        'description': Flags.string({
            description: 'Description for the dashboard',
        }),
    }

    prompts = createVariablePrompts

    public async run(): Promise<void> {
        const { flags } = await this.parse(CreateVariable)
        const { key, name, type, feature, headless, project, variations } = flags
        await this.requireProject(project, headless)

        if (headless && (!key || !name || !type || !feature)) {
            this.writer.showError('The key, name, feature, and type flags are required')
            return
        }
        if (headless && variations && !feature) {
            this.writer.showError('Cannot modify variations without associating to a feature')
            return
        }
        flags._feature = feature

        let params = await this.populateParametersWithZod(CreateVariableDto, this.prompts, flags)
        if (!headless) {
            const { associateToFeature } = await inquirer.prompt([{
                name: 'associateToFeature',
                message: 'Would you like to associate this variable to a feature?',
                type: 'confirm',
                default: false
            }])

            if (associateToFeature) {
                const { feature } = await inquirer.prompt([featurePrompt])
                if (!feature) {
                    this.writer.showError(`Feature with key ${feature.key} could not be found`)
                    return
                }
                params = await this.populateParametersWithZod(CreateVariableDto, [], params)
                const variableListOptions = new VariableListOptions(
                    [params as Variable],
                    this.writer,
                    !variations ? feature.variations: undefined // don't prompt for variations if flag provided
                )
                await variableListOptions.promptVariationValues(params as Variable)
                const featureParams = await this.populateParametersWithZod(UpdateFeatureDto, this.prompts, {
                    key: feature.key,
                    name: feature.name,
                    variations: JSON.parse(feature.ariations),
                    headless,
                })
                await updateFeature(this.authToken, this.projectKey, feature.key, featureParams)

            }
        }
        const result = await createVariable(this.authToken, this.projectKey, params)
        this.writer.showResults(result)
    }
}
