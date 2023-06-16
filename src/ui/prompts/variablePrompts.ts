import { Variable } from '../../api/schemas'
import { fetchVariables, variableTypes } from '../../api/variables'
import { ListQuestion, Question } from 'inquirer'
import { PromptResult } from '.'
import chalk from 'chalk'
import { autocompleteSearch } from '../autocomplete'

type VariableChoice = {
    name: string,
    value: Variable
}

export type VariablePromptResult = {
    variable: VariableChoice['value']
} & PromptResult

let choices: { name: string, value: Variable }[]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const variableChoices = async (input: Record<string, any>, search: string):Promise<VariableChoice[]> => {
    if (!choices) {
        const variables = await fetchVariables(input.token, input.projectKey)
        choices = variables.map((variable) => {
            const name = variable.name ? `${variable.name} ${chalk.dim(`(${variable.key})`)}` : variable.key
            return {
                name,
                value: variable
            }
        })
    }
    return autocompleteSearch(choices, search)
}

export const variablePrompt = {
    name: 'variable',
    message: 'Which variable?',
    type: 'autocomplete',
    source: variableChoices
}

export const variablePromptNoApi = {
    name: 'variable',
    message: 'Please enter a variable key:'
}

export const variableTypePrompt = {
    name: 'type',
    message: 'The type of variable',
    type: 'list',
    choices: variableTypes
}

export const variableValueStringPrompt = (variableKey: string): Question => {
    return {
        name: variableKey,
        message: `Variable value for ${variableKey}`,
    }
}

export const variableValueNumberPrompt = (variableKey: string): Question => {
    return {
        name: variableKey,
        message: `Variable value for ${variableKey}`,
        type: 'input',
        filter: (input: string): number | string => {
            if (isNaN(Number(input))) {
                return 'NaN'
            } else {
                return Number(input)
            }
        },
        validate: (input: string): boolean | string => {
            if (isNaN(Number(input))) {
                return 'Please enter a number'
            }
            return true
        } 
    }
}

export const variableValueBooleanPrompt  = (variableKey: string): ListQuestion => {
    return {
        name: variableKey,
        message: `Variable value for ${variableKey}`,
        type: 'list',
        choices: [
            {
                name: 'true',
                value: true
            },
            {
                name: 'false',
                value: false
            }
        ]
    }
}

export const variableValueJSONPrompt  = (variableKey: string): Question => {
    return {
        name: variableKey,
        message: `Variable value for ${variableKey}`,
        type: 'input',
        validate: (input: string): boolean | string => {
            try {
                const parsedInput = JSON.parse(input)
                if (typeof parsedInput === 'object') {
                    return true
                } else {
                    return 'Please enter a valid JSON object'
                }
            } catch (e) {
                return 'Please enter a valid JSON object'
            }
        } 
    }
}
