import { plainToClass } from 'class-transformer'
import { createVariablePrompts } from '../variablePrompts'
import { ListOption, ListOptionsPrompt } from './listOptionsPrompt'
import inquirer from 'inquirer'
import { validateSync } from 'class-validator'
import { reportValidationErrors } from '../../../utils/reportValidationErrors'
import { AddItemPrompt, EditItemPrompt, RemoveItemPrompt, ContinuePrompt, ExitPrompt } from './promptOptions'
import { CreateVariationParams } from '../../../api/variations'

export class VariationListOptions extends ListOptionsPrompt<CreateVariationParams> {
    itemType = 'Variation'
    messagePrompt = 'Manage your Variations'

    options() {
        return [
            AddItemPrompt(this.itemType),
            EditItemPrompt(this.itemType),
            RemoveItemPrompt(this.itemType),
            ContinuePrompt,
            ExitPrompt
        ]
    }
    async promptAddItem<CreateVariationParams>(): Promise<ListOption<CreateVariationParams>> {
        const prompts = createVariablePrompts.filter((prompt) => prompt.name !== 'feature')
        // TODO: the following validation code is taken from createCommand.ts,
        // rip it out of there and put it in a utility function to be able to be reused
        const variable = plainToClass(CreateVariationParams, await inquirer.prompt(prompts))
        const errors = validateSync(variable, {
            whitelist: true,
        })
        reportValidationErrors(CreateVariationParams.name, errors)
        return {
            name: variable.name,
            value: variable as CreateVariationParams
        }
    }

    async promptEditItem<CreateVariableParams>(
        list: ListOption<CreateVariableParams>[]
    ): Promise<ListOption<CreateVariableParams>> {
        return Promise.resolve(list[0])
    }

    transformToListOptions(list: CreateVariationParams[]): ListOption<CreateVariationParams>[] {
        return list.map((createVariable) => ({
            name: createVariable.name,
            value: createVariable
        }))
    }
}