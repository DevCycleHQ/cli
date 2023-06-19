import { plainToClass } from 'class-transformer'
import { CreateVariableParams } from '../../../api/variables'
import { createVariablePrompts } from '../variablePrompts'
import { ListOption, ListOptionsPrompt } from './listOptionsPrompt'
import inquirer from 'inquirer'
import { validateSync } from 'class-validator'
import { reportValidationErrors } from '../../../utils/reportValidationErrors'
import { AddItemPrompt, EditItemPrompt, RemoveItemPrompt, ContinuePrompt, ExitPrompt } from './promptOptions'

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
    variablePropertyPrompts = createVariablePrompts.filter((prompt) => prompt.name !== 'feature')

    async promptAddItem<CreateVariableParams>(): Promise<ListOption<CreateVariableParams>> {
        // TODO: the following validation code is taken from createCommand.ts,
        // rip it out of there and put it in a utility function to be able to be reused
        const variable = await inquirer.prompt(this.variablePropertyPrompts)
        this.validateVariable(variable)
        return {
            name: variable.name,
            value: variable as CreateVariableParams
        }
    }

    async promptEditItem<CreateVariableParams>(
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
        this.validateVariable(editedVariable)
        if (index >= 0) {
            list[index] = {
                name: editedVariable.name,
                value: editedVariable as CreateVariableParams
            }
        }
    }

    transformToListOptions(list: CreateVariableParams[]): ListOption<CreateVariableParams>[] {
        return list.map((createVariable) => ({
            name: createVariable.name,
            value: createVariable
        }))
    }
    
    validateVariable(variable: CreateVariableParams) {
        const variableParams = plainToClass(CreateVariableParams, variable)
        const errors = validateSync(variableParams, {
            whitelist: true,
        })
        reportValidationErrors(errors)
    }
}
