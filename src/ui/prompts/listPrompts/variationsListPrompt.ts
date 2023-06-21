
import { CreateVariationParams } from '../../../api/schemas'
import { ListOption, ListOptionsPrompt } from './listOptionsPrompt'
import { AddItemPrompt, EditItemPrompt, RemoveItemPrompt, ContinuePrompt, ExitPrompt } from './promptOptions'

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
        // TODO: Implement add item
        return {
            name: 'Placeholder',
            value: {} as CreateVariationParams
        }
    }

    async promptEditItem<CreateVariationParams>(
        list: ListOption<CreateVariationParams>[]
    ): Promise<ListOption<CreateVariationParams>> {
        // TODO: Implement edit item
        return Promise.resolve(list[0])
    }

    transformToListOptions(list: CreateVariationParams[]): ListOption<CreateVariationParams>[] {
        return list.map((createVariation) => ({
            name: createVariation.name,
            value: createVariation
        }))
    }
}
