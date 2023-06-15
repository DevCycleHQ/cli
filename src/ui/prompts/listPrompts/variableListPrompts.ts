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
    async promptAddItem<CreateVariableParams>(): Promise<ListOption<CreateVariableParams>> {
        const prompts = createVariablePrompts.filter((prompt) => prompt.name !== 'feature')
        // TODO: the following validation code is taken from createCommand.ts,
        // rip it out of there and put it in a utility function to be able to be reused
        const variable = plainToClass(CreateVariableParams, await inquirer.prompt(prompts))
        const errors = validateSync(variable, {
            whitelist: true,
        })
        reportValidationErrors(CreateVariableParams.name, errors)
        return {
            name: variable.name,
            value: variable as CreateVariableParams
        }
    }

    async promptEditItem<CreateVariableParams>(
        list: ListOption<CreateVariableParams>[]
    ): Promise<ListOption<CreateVariableParams>> {
        return Promise.resolve(list[0])
    }

    transformToListOptions(list: CreateVariableParams[]): ListOption<CreateVariableParams>[] {
        return list.map((createVariable) => ({
            name: createVariable.name || `${this.itemType} ${list.length}`,
            value: createVariable
        }))
    }
}