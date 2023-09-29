import { CreateVariableDto, Variable, Variation } from '../../api/schemas'
import { fetchVariables } from '../../api/variables'
import { AutoCompletePrompt, Prompt, PromptResult } from '.'
import chalk from 'chalk'
import { autocompleteSearch } from '../autocomplete'
import { descriptionPrompt, hintTextTransformer, keyPrompt, namePrompt } from './commonPrompts'

type VariableChoice = {
    name: string,
    value: Variable
}

export type VariablePromptResult = {
    variable: VariableChoice['value']
} & PromptResult

let choices: { name: string, value: Variable }[]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const variableChoices = async (input: Record<string, any>, search: string): Promise<VariableChoice[]> => {
    if (!choices) {
        const variables = await fetchVariables(input.token, input.projectKey, { perPage: 1000 })
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
    choices: CreateVariableDto.shape.type.options
}

export const variableValueStringPrompt = (key: string, defaultValue?: string, name?: string): Prompt => {
    return {
        name: key,
        default: defaultValue,
        type: 'input',
        message: `Variable value for ${name || key}`,
        transformer: hintTextTransformer('(String)'),
    }
}

export const variableValueNumberPrompt = (key: string, defaultValue?: number, name?: string): Prompt => {
    return {
        name: key,
        message: `Variable value for ${name || key}`,
        type: 'input',
        default: defaultValue,
        transformer: hintTextTransformer('(Number)'),
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

export const variableValueBooleanPrompt  = (key: string, defaultValue?: boolean, name?: string): Prompt => {
    return {
        name: key,
        message: `Variable value for ${name || key}`,
        type: 'list',
        suffix: `${chalk.dim(' (Boolean)')}`,
        default: defaultValue,
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

export const variableValueJSONPrompt = (key: string, defaultValue?: string, name?: string): Prompt => {
    return {
        name: key,
        message: `Variable value for ${name || key}`,
        type: 'input',
        default: defaultValue,
        transformer: hintTextTransformer('(JSON)'),
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

export const getVariableValuePrompt = (
    variation: Variation, 
    variableType: 'String' | 'Boolean' | 'Number' | 'JSON',
    defaultValue?: string | number | boolean
) => {
    switch (variableType) {
        case 'Boolean':
            return variableValueBooleanPrompt(variation.key, defaultValue as boolean | undefined, variation.name)
        case 'Number':
            return variableValueNumberPrompt(variation.key, defaultValue as number | undefined, variation.name)
        case 'JSON':
            return variableValueJSONPrompt(variation.key, defaultValue as string | undefined, variation.name)
        default:
            return variableValueStringPrompt(variation.key, defaultValue as string | undefined, variation.name)
    }
}

export const createVariablePrompts: (Prompt | AutoCompletePrompt)[] = [
    namePrompt,
    keyPrompt,
    descriptionPrompt,
    variableTypePrompt
]
