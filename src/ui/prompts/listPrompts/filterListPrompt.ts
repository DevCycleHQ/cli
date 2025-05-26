import { ListOption, ListOptionsPrompt } from './listOptionsPrompt'
import inquirer from 'inquirer'
import {
    filterAudiencesPrompt,
    filterComparatorPrompt,
    filterDataKeyPrompt,
    filterDataKeyTypePrompt,
    filterSubTypePrompt,
    filterTypePrompt,
    filterValuesPrompt,
    reusableAudienceFilterPrompt,
} from '../targetingPrompts'
import { Audience, Filter } from '../../../api/schemas'
import { Prompt } from '../types'
import { chooseFields } from '../../../utils/prompts'
import { UserSubType } from '../../../api/targeting'
import { renderDefinitionTree } from '../../targetingTree'
import Writer from '../../writer'

export class FilterListOptions extends ListOptionsPrompt<Filter> {
    itemType = 'Filter'
    messagePrompt = 'Manage your filters'

    operator: Audience['filters']['operator'] = 'and'
    audiences: Audience[]

    constructor(list: Filter[], audiences: Audience[], writer: Writer) {
        super(list, writer)
        this.audiences = audiences
    }

    async promptAddItem(): Promise<ListOption<Filter>> {
        const { type } = await inquirer.prompt([filterTypePrompt])
        if (type === 'all') {
            const filter = { type: 'all' as const }
            return {
                name: JSON.stringify(filter),
                value: { item: filter },
            }
        } else if (type === 'audienceMatch') {
            const { comparator, reusableAudiences } = await inquirer.prompt([
                filterComparatorPrompt,
                reusableAudienceFilterPrompt(this.audiences),
            ])
            const reusableAudiencesList = reusableAudiences.map(
                (audience: Audience) => audience._id,
            )
            const filter = {
                type: 'audienceMatch' as const,
                comparator,
                _audiences: reusableAudiencesList,
            }
            return {
                name: JSON.stringify(filter),
                value: { item: filter },
            }
        }
        const { subType } = await inquirer.prompt([filterSubTypePrompt])
        const rest = await inquirer.prompt(
            [filterComparatorPrompt, filterValuesPrompt],
            {
                subType,
            },
        )

        if (rest.values) {
            rest.values = rest.values
                .split(',')
                .map((value: string) => value.trim())
        }
        if (rest.subType === 'customData') {
            const { dataKey, dataKeyType } = await inquirer.prompt([
                filterDataKeyPrompt,
                filterDataKeyTypePrompt,
            ])
            rest.dataKey = dataKey
            rest.dataKeyType = dataKeyType
        }
        const filter = { type: type, ...rest } as Filter
        return {
            name: JSON.stringify(filter),
            value: { item: filter },
        }
    }

    async promptEditItem(list: ListOption<Filter>[]): Promise<void> {
        if (list.length === 0) {
            this.writer.warningMessage(`No ${this.itemType}s to edit`)
            return
        }

        const { filterListItem } = await inquirer.prompt<{
            filterListItem: ListOption<Filter>['value']
        }>([
            {
                name: 'filterListItem',
                message: `Which ${this.itemType} would you like to edit?`,
                type: 'list',
                choices: list,
            },
        ])
        const index = list.findIndex(
            (listItem) => listItem.value.id === filterListItem.id,
        )

        const filterToEdit = list[index].value.item
        let prompts = this.getPromptsByType(filterToEdit.type)
        if (
            filterToEdit.type !== 'all' &&
            filterToEdit.type !== 'optIn' &&
            filterToEdit.type !== 'audienceMatch'
        ) {
            prompts = [
                ...prompts,
                ...this.getPromptsBySubType(filterToEdit.subType),
            ]
        }

        const fieldsToEdit = await chooseFields(prompts)
        if (fieldsToEdit.length === 0) {
            return
        }

        prompts = prompts.filter((field) => fieldsToEdit.includes(field.name))
        if (fieldsToEdit.includes('type')) {
            const updatedFilterListItem = await this.promptAddItem()
            list[index] = {
                name: updatedFilterListItem.name,
                value: {
                    ...updatedFilterListItem.value,
                    id: filterListItem.id,
                },
            }
            return
        }

        if (
            filterToEdit.type === 'all' ||
            filterToEdit.type === 'optIn' ||
            filterToEdit.type === 'audienceMatch'
        ) {
            prompts = prompts.filter(
                (field) => field.name !== 'type' && field.name !== 'subType',
            )
            const promptsWithDefaults = prompts.map((prompt) => {
                const fieldName = prompt.name as keyof Filter
                return { ...prompt, default: filterToEdit[fieldName] }
            })
            const rest = await inquirer.prompt(promptsWithDefaults)
            const filter = { ...filterToEdit, ...rest }
            list[index] = {
                name: JSON.stringify(filter),
                value: { item: filter, id: filterListItem.id },
            }
            return
        }

        let subType = filterToEdit.subType
        if (fieldsToEdit.includes('subType')) {
            subType = (
                await inquirer.prompt<{ subType: UserSubType }>([
                    filterSubTypePrompt,
                ])
            ).subType
        }

        let promptsWithDefaults: Prompt[]
        if (subType === 'customData') {
            fieldsToEdit.push('dataKey')
            fieldsToEdit.push('dataKeyType')
            const dataKeyDefault =
                filterToEdit.subType === 'customData'
                    ? filterToEdit.dataKey
                    : undefined
            promptsWithDefaults = [
                filterComparatorPrompt,
                filterValuesPrompt,
                { ...filterDataKeyPrompt, default: dataKeyDefault },
                { ...filterDataKeyTypePrompt },
            ]
        } else {
            const valuesDefault =
                filterToEdit.subType !== 'customData'
                    ? filterToEdit.values?.join(',')
                    : undefined
            promptsWithDefaults = [
                filterComparatorPrompt,
                { ...filterValuesPrompt, default: valuesDefault },
            ]
        }
        promptsWithDefaults = promptsWithDefaults.filter((prompt) =>
            fieldsToEdit.includes(prompt.name),
        )

        const rest = await inquirer.prompt(promptsWithDefaults, { subType })
        if (rest.values) {
            rest.values = rest.values
                .split(',')
                .map((value: string) => value.trim())
        }

        const filter = { ...filterToEdit, ...rest }
        list[index] = {
            name: JSON.stringify(filter),
            value: { item: filter, id: filterListItem.id },
        }
    }

    transformToListOptions(list: Filter[]): ListOption<Filter>[] {
        return list.map((filter, index) => ({
            name: JSON.stringify(filter),
            value: { item: filter, id: index },
        }))
    }

    getPromptsByType(type: string): Prompt[] {
        if (type === 'all' || type === 'optIn') {
            return [filterTypePrompt]
        } else if (type === 'audienceMatch') {
            return [
                filterTypePrompt,
                filterComparatorPrompt,
                filterAudiencesPrompt,
            ]
        }
        return [
            filterTypePrompt,
            filterSubTypePrompt,
            filterComparatorPrompt,
            filterValuesPrompt,
        ]
    }

    getPromptsBySubType(subType: string): Prompt[] {
        if (subType === 'customData') {
            return [filterDataKeyPrompt, filterDataKeyTypePrompt]
        }
        return []
    }

    printListOptions(list?: ListOption<Filter>[]) {
        const listToPrint = list || this.list
        if (listToPrint.length === 0) {
            this.writer.infoMessage(`No existing ${this.itemType}s.`)
            return
        }
        this.writer.blankLine()
        this.writer.title(this.messagePrompt)
        this.writer.infoMessage(`Current ${this.itemType}s:`)
        const values = listToPrint.map((item) => item.value.item)
        renderDefinitionTree(values, this.operator, this.audiences)
        this.writer.blankLine()
    }
}
