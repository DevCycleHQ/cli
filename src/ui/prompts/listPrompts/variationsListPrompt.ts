
import { errorMap } from '../../../api/apiClient'
import { CreateVariationDto, CreateVariationParams, Variable, Variation } from '../../../api/schemas'
import inquirer from '../../autocomplete'
import { getVariationVariablesPrompts, staticCreateVariationPrompts } from '../variationPrompts'
import { ListOption, ListOptionsPrompt } from './listOptionsPrompt'

export class VariationListOptions extends ListOptionsPrompt<CreateVariationParams> {
    itemType = 'Variation'
    messagePrompt = 'Manage your Variations'

    featureVariables: Variable[] = []

    getVariationListPrompt = (existingVariations?: Variation[], existingVariables?: Variable[]) => {
        this.featureVariables = existingVariables || []

        return {
            name: 'variations', 
            value: 'variations', 
            message: 'Manage variations',
            type: 'listOptions',
            previousReponseFields: ['variables'], // if variables were just created / updated, use the new variables
            listOptionsPrompt: (previousResponses?: Record<string, any>) => {
                const newVariables = previousResponses?.variables
                this.featureVariables = newVariables || this.featureVariables

                return this.prompt(existingVariations?.map((variation) => ({
                    name: variation.name || variation.key,
                    value: variation
                })))
            }
        }
    }

    async promptAddItem() {
        const variation = await inquirer.prompt(staticCreateVariationPrompts)
        variation.variables = await inquirer.prompt(getVariationVariablesPrompts(this.featureVariables))

        return {
            name: variation.name,
            value: variation
        }
    }

    async promptEditItem(
        list: ListOption<CreateVariationParams>[]
    ) {
        if (list.length === 0) {
            this.writer.warningMessage('No variations to edit')
            return
        }
        const response = await inquirer.prompt([{
            name: 'variationToEdit',
            message: 'Which variation would you like to edit?',
            type: 'list',
            choices: list
        }])
        const index = list.findIndex((listItem) => listItem.value.key === response.variationToEdit.key)

        // Have a default for each of the prompts that correspond to the previous value of the variable
        const filledOutPrompts = staticCreateVariationPrompts.map((prompt) => ({
            ...prompt,
            default: response.variationToEdit[prompt.name]
        }))

        const editedVariation = await inquirer.prompt(filledOutPrompts)
        editedVariation.variables = await inquirer.prompt(
            getVariationVariablesPrompts(this.featureVariables, response.variationToEdit.variables)
        )

        CreateVariationDto.parse(editedVariation, { errorMap })
        if (index >= 0) {
            list[index] = {
                name: editedVariation.name || editedVariation.key,
                value: editedVariation
            }
        }

    }

    transformToListOptions(list: CreateVariationParams[]): ListOption<CreateVariationParams>[] {
        return list.map((createVariation) => ({
            name: createVariation.name,
            value: createVariation
        }))
    }
}
