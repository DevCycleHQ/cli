import { CreateVariableParams, createVariable } from '../../../api/variables'
import { ListOption, ListOptionsPrompt } from './listOptionsPrompt'

export class VariableListOptions extends ListOptionsPrompt<CreateVariableParams> {
    itemType = 'Variable'
    promptAddItem<CreateVariableParams>(): Promise<CreateVariableParams> {
        return Promise.resolve({} as CreateVariableParams)
    }

    promptEditItem<CreateVariableParams>(
        list: ListOption<CreateVariableParams>
    ): Promise<ListOption<CreateVariableParams>> {
        return Promise.resolve(list)
    }

    transformToListOptions(list: CreateVariableParams[]): ListOption<CreateVariableParams>[] {
        return list.map((createVariable) => ({
            name: createVariable.name,
            value: {} as CreateVariableParams
        }))
    }
}