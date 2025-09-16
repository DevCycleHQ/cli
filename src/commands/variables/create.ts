import { Flags } from '@oclif/core'
import { createVariable } from '../../api/variables'
import CreateCommand from '../createCommand'
import { createVariablePrompts, featurePrompt } from '../../ui/prompts'
import { CreateVariableDto, Variable } from '../../api/schemas'
import inquirer from '../../ui/autocomplete'
import { VariableListOptions } from '../../ui/prompts/listPrompts/variablesListPrompt'
import { fetchFeatureByKey, updateFeature } from '../../api/features'

export default class CreateVariable extends CreateCommand {
    static hidden = false
    static description = 'Create a new Variable for an existing Feature.'

    static flags = {
        ...CreateCommand.flags,
        type: Flags.string({
            description: 'The type of variable',
            options: CreateVariableDto.shape.type.options,
        }),
        feature: Flags.string({
            description:
                'The key or id of the feature to create the variable for',
        }),
        variations: Flags.string({
            description:
                'Set a value for this variable in each variation of the associated feature. ' +
                'Should be a JSON object with the keys being variation keys.',
        }),
        description: Flags.string({
            description: 'Description for the dashboard',
        }),
    }

    prompts = createVariablePrompts

    public async run(): Promise<void> {
        const { flags } = await this.parse(CreateVariable)
        const { key, name, type, feature, headless, project, variations } =
            flags
        await this.requireProject(project, headless)

        if (headless && (!key || !name || !type)) {
            this.writer.showError('The key, name, and type flags are required')
            return
        }
        flags._feature = feature
        if (headless && variations && !flags._feature) {
            this.writer.showError(
                'Cannot modify variations without associating to a feature',
            )
            return
        }

        const params = await this.populateParametersWithZod(
            CreateVariableDto,
            this.prompts,
            flags,
        )
        if (!headless) {
            const { associateToFeature } = await inquirer.prompt([
                {
                    name: 'associateToFeature',
                    message:
                        'Would you like to associate this variable to a feature?',
                    type: 'confirm',
                    default: false,
                },
            ])

            if (associateToFeature) {
                const { feature } = await inquirer.prompt([featurePrompt], {
                    token: this.authToken,
                    projectKey: this.projectKey,
                })
                const variableListOptions = new VariableListOptions(
                    [params as Variable],
                    this.writer,
                    !variations ? feature.variations : undefined, // don't prompt for variations if flag provided
                )
                await variableListOptions.promptVariationValues(
                    params as Variable,
                )

                const updatedVariables = feature.variables
                updatedVariables.push(params as Variable)
                const updatedVariations = variableListOptions.featureVariations

                await updateFeature(
                    this.authToken,
                    this.projectKey,
                    feature.key,
                    {
                        variables: updatedVariables,
                        variations: updatedVariations,
                    },
                )
                const message =
                    `The variable was associated to the existing feature ${feature.key}. ` +
                    `Use "dvc features get --keys=${feature.key}" to see its details`
                this.writer.successMessage(message)
            } else {
                const result = await createVariable(
                    this.authToken,
                    this.projectKey,
                    params,
                )
                this.writer.showResults(result)
            }
        } else {
            if (flags._feature) {
                const feature = await fetchFeatureByKey(
                    this.authToken,
                    this.projectKey,
                    flags._feature,
                )
                if (!feature) {
                    this.writer.showError(
                        `Feature with key ${flags._feature} could not be found`,
                    )
                    return
                }

                const parsedVariations = JSON.parse(variations as string)
                const featureVariables = feature.variables || []
                const featureVariations = feature.variations || []
                featureVariables.push(params as Variable)
                for (const featVar of featureVariations) {
                    featVar.variables = featVar.variables || {}
                    featVar.variables[params.key] =
                        parsedVariations[featVar.key]
                }

                await updateFeature(
                    this.authToken,
                    this.projectKey,
                    feature.key,
                    {
                        variations: featureVariations,
                        variables: featureVariables,
                    },
                )
                const message =
                    `The variable was associated to the existing feature ${feature.key}. ` +
                    `Use "dvc features get --keys=${feature.key}" to see its details.`
                this.writer.showRawResults(message)
            } else {
                const result = await createVariable(
                    this.authToken,
                    this.projectKey,
                    params,
                )
                this.writer.showResults(result)
            }
        }
    }
}
