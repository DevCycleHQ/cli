import { ListOption, ListOptionsPrompt } from './listOptionsPrompt'
import inquirer from 'inquirer'
import {
    AddItemPrompt,
    EditItemPrompt,
    RemoveItemPrompt,
    ContinuePrompt,
    ExitPrompt,
    ReorderItemPrompt
} from './promptOptions'
import { servePrompt, audienceNamePrompt } from '../targetingPrompts'
import { Filters, UpdateTargetParams, Variation } from '../../../api/schemas'
import { FilterListOptions } from './filterListPrompt'
import Writer from '../../writer'
import { renderRulesTree } from '../../targetingTree'

export class TargetingListOptions extends ListOptionsPrompt<UpdateTargetParams> {
    itemType = 'Targeting Rule'
    messagePrompt = 'Manage your Targeting'
    authToken: string
    projectKey: string
    featureKey: string

    variations: Variation[] = []

    constructor(list: UpdateTargetParams[], writer: Writer, authToken: string, projectKey: string, featureKey: string) {
        super(list, writer)
        this.featureKey = featureKey
        this.authToken = authToken
        this.projectKey = projectKey
    }

    options() {
        return [
            ContinuePrompt,
            AddItemPrompt(this.itemType),
            EditItemPrompt(this.itemType),
            ReorderItemPrompt(this.itemType),
            RemoveItemPrompt(this.itemType),
            ExitPrompt
        ]
    }

    async promptAddItem(): Promise<ListOption<UpdateTargetParams>> {
        const { name, serve } = await inquirer.prompt([audienceNamePrompt, servePrompt], {
            token: this.authToken,
            projectKey: this.projectKey,
            featureKey: this.featureKey
        })
        const filters: Filters = await (new FilterListOptions([], this.writer)).prompt()
        const target = {
            distribution: [{ _variation: serve.key, percentage: 1 }],
            audience: { name, filters: { filters, operator: 'and' } }
        }

        return {
            name: target.audience.name,
            value: { item: target as UpdateTargetParams }
        }
    }

    async promptEditItem(
        list: ListOption<UpdateTargetParams>[]
    ): Promise<void> {
        if (list.length === 0) {
            this.writer.warningMessage(`No ${this.itemType}s to edit`)
            return
        }

        const { targetListItem } = await inquirer.prompt<{ targetListItem: ListOption<UpdateTargetParams>['value'] }>([{
            name: 'targetListItem',
            message: `Which ${this.itemType} would you like to edit?`,
            type: 'list',
            choices: list
        }])
        const index = list.findIndex((item) => {
            // if the target to edit has an _id, we know it's an existing target so compare _id
            if (targetListItem.item._id && targetListItem.item._id === item.value.item._id) return true
            // otherwise the target is newly added so compare the id that's on the list option
            return item.value.id === targetListItem.id
        })
        const targetToEdit = targetListItem.item

        const promptsWithDefaults = [
            { ...audienceNamePrompt, default: targetToEdit.audience.name },
            { ...servePrompt, default: targetToEdit.distribution[0]._variation }
        ]

        const { name, serve } = await inquirer.prompt(promptsWithDefaults, {
            token: this.authToken,
            projectKey: this.projectKey,
            featureKey: this.featureKey
        })
        const filters: Filters =
            await (new FilterListOptions(targetToEdit.audience.filters.filters, this.writer)).prompt()
        const target = {
            distribution: [{ _variation: serve.key, percentage: 1 }],
            audience: { name, filters: { filters, operator: 'and' } }
        }

        list[index] = {
            name: target.audience.name,
            value: { item: target as UpdateTargetParams, id: targetListItem.id }
        }
    }

    transformToListOptions(list: UpdateTargetParams[]): ListOption<UpdateTargetParams>[] {
        // TODO: default name is temporary until we have a better way to identify targeting rules
        return list.map((target, index) => ({
            name: target.audience.name || target.name || `Targeting Rule ${index + 1}`,
            value: { item: target, id: index }
        }))
    }

    async printListOptions(list?: ListOption<UpdateTargetParams>[]) {
        const listToPrint = list || this.list
        this.writer.statusMessage(`Current ${this.itemType}s:`)
        const values = listToPrint.map((item) => item.value.item)
        renderRulesTree(values, this.variations)
        this.writer.divider()
    }
}