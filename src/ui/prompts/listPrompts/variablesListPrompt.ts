import { createVariablePrompts } from '../variablePrompts'
import { ListOption, ListOptionsPrompt } from './listOptionsPrompt'
import inquirer from 'inquirer'
import { AddItemPrompt, EditItemPrompt, RemoveItemPrompt, ContinuePrompt, ExitPrompt } from './promptOptions'
import { CreateVariableDto, CreateVariableParams, UpdateVariableDto, Variable } from '../../../api/schemas'
import { errorMap } from '../../../api/apiClient'

export class VariableListOptions extends ListOptionsPrompt<CreateVariableParams> {
    itemType = 'Variable'
    messagePrompt = 'Manage your Variables'

    options() {
        return [
            AddItemPrompt(this.itemType),
            EditItemPrompt(this.itemType),
            RemoveItemPrompt(this.itemType),
            ContinuePrompt,
            ExitPrompt
        ]
    }
    variablePropertyPrompts = createVariablePrompts.filter((prompt) => prompt.name !== '_feature')

    getVariablesListPrompt = (existingVariables?: Variable[]) => ({
        name: 'variables', 
        value: 'variables', 
        message: 'Manage variables',
        type: 'listOptions',
        listOptionsPrompt: () => this.prompt(existingVariables?.map((variable) => ({
            name: variable.name || variable.key,
            value: variable
        })))
    })
 
    async promptAddItem(): Promise<ListOption<CreateVariableParams>> {
        const variable = await inquirer.prompt(this.variablePropertyPrompts)
        CreateVariableDto.parse(variable, { errorMap })
        return {
            name: variable.name,
            value: variable as CreateVariableParams
        }
    }

    async promptEditItem(
        list: ListOption<CreateVariableParams>[]
    ): Promise<void> {
        if (list.length === 0) {
            this.writer.warningMessage('No variables to edit')
            return
        }
        const response = await inquirer.prompt([{
            name: 'variableToEdit',
            message: 'Which variable would you like to edit?',
            type: 'list',
            choices: list
        }])
        const index = list.findIndex((listItem) => listItem.name === response.variableToEdit.name)

        // Have a default for each of the prompts that correspond to the previous value of the variable
        const filledOutPrompts = this.variablePropertyPrompts.map((prompt) => ({
            ...prompt,
            default: response.variableToEdit[prompt.name]
        }))

        const editedVariable = await inquirer.prompt(filledOutPrompts)
        UpdateVariableDto.parse(editedVariable, { errorMap })
        if (index >= 0) {
            list[index] = {
                name: editedVariable.name || editedVariable.key,
                value: editedVariable as CreateVariableParams
            }
        }
    }

    transformToListOptions(list: CreateVariableParams[]): ListOption<CreateVariableParams>[] {
        return list.map((createVariable) => ({
            name: createVariable.name || createVariable.key,
            value: createVariable
        }))
    }
    
}
