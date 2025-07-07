import chalk from 'chalk'
import { fetchEnvironments } from '../../api/environments'
import { PromptResult } from '.'
import { CreateEnvironmentDto, Environment } from '../../api/schemas'

import { autocompleteSearch } from '../autocomplete'

export type EnvironmentChoice = {
    name: string
    value: Environment
}

export type EnvironmentPromptResult = {
    environment: EnvironmentChoice['value']
} & PromptResult

const EnvironmentTypeValue: Record<string, number> = {
    development: 0,
    staging: 1,
    production: 2,
    disaster_recovery: 3,
}

let choices: { name: string; value: Environment }[]

export const environmentChoices = async (
    input: Record<string, any>,
    search: string,
): Promise<EnvironmentChoice[]> => {
    if (!choices) {
        const environments = await fetchEnvironments(
            input.token,
            input.projectKey,
        )
        choices = environments
            .map((environment) => {
                const name = environment.name
                    ? `${environment.name} ${chalk.dim(`(${environment.key})`)}`
                    : environment.key
                return {
                    name,
                    value: environment,
                }
            })
            .sort(
                (a, b) =>
                    EnvironmentTypeValue[a.value.type] -
                    EnvironmentTypeValue[b.value.type],
            )
    }
    return autocompleteSearch(choices, search)
}

export const environmentPrompt = {
    name: 'environment',
    message: 'Which environment?',
    type: 'autocomplete',
    source: environmentChoices,
}

export const environmentTypePrompt = {
    name: 'type',
    message: 'The type of environment',
    type: 'list',
    choices: CreateEnvironmentDto.shape.type.options,
}

export const sdkKeyTypePrompt = {
    name: 'sdkType',
    message: 'Which SDK?',
    type: 'list',
    choices: ['client', 'mobile', 'server', 'all'],
}
