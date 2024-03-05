import { ListOption, ListOptionsPrompt } from './listOptionsPrompt'
import inquirer from 'inquirer'
import {
    AddItemPrompt,
    EditItemPrompt,
    RemoveItemPrompt,
    ContinuePrompt,
    ExitPrompt,
    ReorderItemPrompt,
} from './promptOptions'
import { servePrompt } from '../targetingPrompts'
import {
    Audience,
    Filters,
    UpdateTargetParams,
    Variation,
} from '../../../api/schemas'
import { FilterListOptions } from './filterListPrompt'
import Writer from '../../writer'
import { renderRulesTree } from '../../targetingTree'
import { namePrompt } from '../commonPrompts'

export class TargetingListOptions extends ListOptionsPrompt<UpdateTargetParams> {
    itemType = 'Targeting Rule'
    messagePrompt = 'Manage your Targeting'
    authToken: string
    projectKey: string
    featureKey: string

    variations: Variation[] = []
    audiences: Audience[]

    constructor(
        list: UpdateTargetParams[],
        audiences: Audience[],
        writer: Writer,
        authToken: string,
        projectKey: string,
        featureKey: string,
    ) {
        super(list, writer)
        this.audiences = audiences
        this.featureKey = featureKey
        this.authToken = authToken
        this.projectKey = projectKey
    }

    getTargetingListPrompt = () => ({
        name: 'targets',
        value: 'targets',
        message: 'Manage Targeting Rules',
        type: 'listOptions',
        listOptionsPrompt: () => this.prompt(),
    })

    options() {
        return [
            ContinuePrompt,
            AddItemPrompt(this.itemType),
            EditItemPrompt(this.itemType),
            ReorderItemPrompt(this.itemType),
            RemoveItemPrompt(this.itemType),
            ExitPrompt,
        ]
    }

    async promptAddItem(): Promise<ListOption<UpdateTargetParams>> {
        const { name, serve } = await inquirer.prompt(
            [namePrompt, servePrompt],
            {
                token: this.authToken,
                projectKey: this.projectKey,
                featureKey: this.featureKey,
            },
        )
        const operator = 'and'
        const filterListOptions = new FilterListOptions(
            [],
            this.audiences,
            this.writer,
        )
        filterListOptions.operator = operator
        const filters = await filterListOptions.prompt()
        const target = {
            distribution: [{ _variation: serve.key, percentage: 1 }],
            audience: { name, filters: { filters, operator } },
        }

        return {
            name: target.audience.name,
            value: { item: target as UpdateTargetParams },
        }
    }

    async promptEditItem(
        list: ListOption<UpdateTargetParams>[],
    ): Promise<void> {
        if (list.length === 0) {
            this.writer.warningMessage(`No ${this.itemType}s to edit`)
            return
        }

        const { targetListItem } = await inquirer.prompt<{
            targetListItem: ListOption<UpdateTargetParams>['value']
        }>([
            {
                name: 'targetListItem',
                message: `Which ${this.itemType} would you like to edit?`,
                type: 'list',
                choices: list,
            },
        ])
        const index = list.findIndex((item) => {
            // if the target to edit has an _id, we know it's an existing target so compare _id
            if (
                targetListItem.item._id &&
                targetListItem.item._id === item.value.item._id
            )
                return true
            // otherwise the target is newly added so compare the id that's on the list option
            return item.value.id === targetListItem.id
        })
        const targetToEdit = targetListItem.item

        const promptsWithDefaults = [
            { ...namePrompt, default: targetToEdit.audience.name },
            {
                ...servePrompt,
                default: targetToEdit.distribution[0]._variation,
            },
        ]

        const { name, serve } = await inquirer.prompt(promptsWithDefaults, {
            token: this.authToken,
            projectKey: this.projectKey,
            featureKey: this.featureKey,
        })
        const filterListOptions = new FilterListOptions(
            targetToEdit.audience.filters.filters,
            this.audiences,
            this.writer,
        )
        filterListOptions.operator = targetToEdit.audience.filters.operator
        const filters = await filterListOptions.prompt()
        const target = {
            distribution: [{ _variation: serve.key, percentage: 1 }],
            audience: { name, filters: { filters, operator: 'and' } },
        }

        list[index] = {
            name: target.audience.name,
            value: {
                item: target as UpdateTargetParams,
                id: targetListItem.id,
            },
        }
    }

    transformToListOptions(
        list: UpdateTargetParams[],
    ): ListOption<UpdateTargetParams>[] {
        // TODO: default name is temporary until we have a better way to identify targeting rules
        return list.map((target, index) => ({
            name:
                target.audience.name ||
                target.name ||
                `Targeting Rule ${index + 1}`,
            value: { item: target, id: index },
        }))
    }

    printListOptions(list?: ListOption<UpdateTargetParams>[]) {
        const listToPrint = list || this.list
        if (listToPrint.length === 0) {
            this.writer.infoMessage(`No existing ${this.itemType}s.`)
            return
        }
        this.writer.blankLine()
        this.writer.title(this.messagePrompt)
        this.writer.infoMessage(`Current ${this.itemType}s:`)
        const values = listToPrint.map((item) => item.value.item)
        renderRulesTree(values, this.variations, this.audiences)
        this.writer.blankLine()
    }
}
