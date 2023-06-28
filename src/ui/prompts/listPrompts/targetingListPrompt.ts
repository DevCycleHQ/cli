import { ListOption, ListOptionsPrompt } from './listOptionsPrompt'
import inquirer from 'inquirer'
import { servePrompt, audienceNamePrompt } from '../targetingPrompts'
import { Filters, UpdateTargetParams } from '../../../api/schemas'
import { FilterListOptions } from './filterListPrompt'
import Writer from '../../writer'

export class TargetingListOptions extends ListOptionsPrompt<UpdateTargetParams> {
    itemType = 'Targeting Rule'
    messagePrompt = 'Manage your Targeting'
    authToken: string
    projectKey: string
    featureKey: string

    constructor(list: UpdateTargetParams[], writer: Writer, authToken: string, projectKey: string, featureKey: string) {
        super(list, writer)
        this.featureKey = featureKey
        this.authToken = authToken
        this.projectKey = projectKey
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
            value: target as UpdateTargetParams
        }
    }

    async promptEditItem(
        list: ListOption<UpdateTargetParams>[]
    ): Promise<void> {
        if (list.length === 0) {
            this.writer.warningMessage(`No ${this.itemType}s to edit`)
            return
        }

        const response = await inquirer.prompt([{
            name: 'targetToEdit',
            message: `Which ${this.itemType} would you like to edit?`,
            type: 'list',
            choices: list
        }])
        const index = list.findIndex((item) => {
            if (item.value._id && item.value._id === response.targetToEdit._id) {
                return true
            }
            return item.name === response.targetToEdit.audience.name
        })

        const promptsWithDefaults = [
            { ...audienceNamePrompt, default: response.targetToEdit.audience.name },
            { ...servePrompt, default: response.targetToEdit.distribution[0]._variation }
        ]

        const { name, serve } = await inquirer.prompt(promptsWithDefaults, {
            token: this.authToken,
            projectKey: this.projectKey,
            featureKey: this.featureKey
        })
        const filters: Filters =
            await (new FilterListOptions(response.targetToEdit.audience.filters.filters, this.writer)).prompt()
        const target = {
            distribution: [{ _variation: serve.key, percentage: 1 }],
            audience: { name, filters: { filters, operator: 'and' } }
        }

        list[index] = {
            name: target.audience.name,
            value: target as UpdateTargetParams
        }
    }

    transformToListOptions(list: UpdateTargetParams[]): ListOption<UpdateTargetParams>[] {
        // TODO: default name is temporary until we have a better way to identify targeting rules
        return list.map((target, index) => ({
            name: target.audience.name || target.name || `Targeting Rule ${index + 1}`,
            value: target
        }))
    }
}