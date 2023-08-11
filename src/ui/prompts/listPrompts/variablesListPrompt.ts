import { createVariablePrompts, getVariableValuePrompt } from '../variablePrompts'
import { ListOption, ListOptionsPrompt } from './listOptionsPrompt'
import inquirer from 'inquirer'
import { 
    CreateVariableDto, 
    CreateVariableParams, 
    UpdateVariableDto, 
    Variable,
    Variation 
} from '../../../api/schemas'
import { errorMap } from '../../../api/apiClient'
import Writer from '../../writer'

export class VariableListOptions extends ListOptionsPrompt<CreateVariableParams> {
    itemType = 'Variable'
    messagePrompt = 'Manage your Variables'

    variablePropertyPrompts = createVariablePrompts.filter((prompt) => prompt.name !== '_feature')
    featureVariations: Variation[]

    constructor(list: Variable[], writer: Writer, variations?: Variation[]) {
        super(list, writer)
        if (variations) {
            this.featureVariations = variations
        }
    }

    getVariablesListPrompt = () => ({
        name: 'variables', 
        value: 'variables', 
        message: 'Manage variables',
        type: 'listOptions',
        listOptionsPrompt: () => this.prompt()
    })

    private async promptVariationValues(variable: Variable) {
        if (this.featureVariations?.length) {
            for (const variation of this.featureVariations) {
                const variationPrompt = getVariableValuePrompt(
                    variation, 
                    variable.type, 
                    variation.variables?.[variable.key] as string | number | boolean
                )

                const result = await inquirer.prompt([variationPrompt])
                variation.variables = variation.variables || {}
                variation.variables[variable.key] = result[variation.key]
            }
        }
    }

    async promptAddItem(): Promise<ListOption<CreateVariableParams>> {
        const variable = await inquirer.prompt(this.variablePropertyPrompts)
        await this.promptVariationValues(variable)

        CreateVariableDto.parse(variable, { errorMap })
        return {
            name: variable.name,
            value: { item: variable as CreateVariableParams }
        }
    }

    async promptEditItem(
        list: ListOption<CreateVariableParams>[]
    ): Promise<void> {
        if (list.length === 0) {
            this.writer.warningMessage('No variables to edit')
            return
        }
        const { variableListItem } = await inquirer.prompt([{
            name: 'variableListItem',
            message: 'Which variable would you like to edit?',
            type: 'list',
            choices: list
        }])
        const index = list.findIndex((listItem) => (listItem.value.item.key === variableListItem.item.key)) 

        // Have a default for each of the prompts that correspond to the previous value of the variable
        const filledOutPrompts = this.variablePropertyPrompts.map((prompt) => ({
            ...prompt,
            default: variableListItem.item[prompt.name]
        }))

        const editedVariable = await inquirer.prompt(filledOutPrompts)
        await this.promptVariationValues(editedVariable)

        UpdateVariableDto.parse(editedVariable, { errorMap })
        if (index >= 0) {
            list[index] = {
                name: editedVariable.name || editedVariable.key,
                value: { item: editedVariable as CreateVariableParams, id: variableListItem.id }
            }
        }
    }

    transformToListOptions(list: CreateVariableParams[]): ListOption<CreateVariableParams>[] {
        return list.map((createVariable, index) => ({
            name: createVariable.name || createVariable.key,
            value: { item: createVariable, id: index } 
        }))
    }
}
