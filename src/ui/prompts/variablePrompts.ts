import { CreateVariableDto, Variable, Variation } from '../../api/schemas'
import { fetchVariables } from '../../api/variables'
import { AutoCompletePrompt, Prompt, PromptResult } from '.'
import chalk from 'chalk'
import { autocompleteSearch } from '../autocomplete'
import {
    descriptionPrompt,
    hintTextTransformer,
    keyPrompt,
    namePrompt,
} from './commonPrompts'
import { Variable as CleanupVariable } from '../../commands/cleanup/types'

type VariablePromptEntity =
    | { value: Variation; type: 'variation' }
    | { value: Variable; type: 'variable' }
    | { value: CleanupVariable; type: 'cleanupVariable' }

type VariableChoice = {
    name: string
    value: Variable
}

export type VariablePromptResult = {
    variable: VariableChoice['value']
} & PromptResult

let choices: { name: string; value: Variable }[]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const variableChoices = async (
    input: Record<string, any>,
    search: string,
): Promise<VariableChoice[]> => {
    if (!choices) {
        const variables = await fetchVariables(input.token, input.projectKey, {
            perPage: 1000,
        })
        choices = variables.map((variable) => {
            const name = variable.name
                ? `${variable.name} ${chalk.dim(`(${variable.key})`)}`
                : variable.key
            return {
                name,
                value: variable,
            }
        })
    }
    return autocompleteSearch(choices, search)
}

export const variablePrompt = {
    name: 'variable',
    message: 'Which variable?',
    type: 'autocomplete',
    source: variableChoices,
}

export const variablePromptNoApi = {
    name: 'variable',
    message: 'Please enter a variable key:',
}

export const variableTypePrompt = {
    name: 'type',
    message: 'The type of variable',
    type: 'list',
    choices: CreateVariableDto.shape.type.options,
}

const baseVariableValuePrompt = (
    entity: VariablePromptEntity,
    defaultValue?: string | number | boolean,
): Prompt => {
    const key = entity.value.key
    const messageIdentifier =
        entity.type === 'variation' ? entity.value.name : entity.value.key
    return {
        name: key,
        message: `Variable value for ${messageIdentifier}`,
        type: 'input',
        default: defaultValue,
    }
}

export const variableValueStringPrompt = (
    entity: VariablePromptEntity,
    defaultValue?: string,
): Prompt => {
    const basePrompt = baseVariableValuePrompt(entity, defaultValue)
    return {
        ...basePrompt,
        transformer: hintTextTransformer('(String)'),
    }
}

export const variableValueNumberPrompt = (
    entity: VariablePromptEntity,
    defaultValue?: number,
): Prompt => {
    const basePrompt = baseVariableValuePrompt(entity, defaultValue)
    return {
        ...basePrompt,
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
        },
    }
}

export const variableValueBooleanPrompt = (
    entity: VariablePromptEntity,
    defaultValue?: boolean,
): Prompt => {
    const basePrompt = baseVariableValuePrompt(entity, defaultValue)
    return {
        ...basePrompt,
        type: 'list',
        suffix: `${chalk.dim(' (Boolean)')}`,
        default: defaultValue,
        choices: [
            {
                name: 'true',
                value: true,
            },
            {
                name: 'false',
                value: false,
            },
        ],
    }
}

export const variableValueJSONPrompt = (
    entity: VariablePromptEntity,
    defaultValue?: string,
): Prompt => {
    const basePrompt = baseVariableValuePrompt(entity, defaultValue)
    return {
        ...basePrompt,
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
        },
    }
}

export const getVariableValuePrompt = (
    variation: Variation,
    variableType: 'String' | 'Boolean' | 'Number' | 'JSON',
    defaultValue?: string | number | boolean,
) => {
    switch (variableType) {
        case 'Boolean':
            return variableValueBooleanPrompt(
                { value: variation, type: 'variation' },
                defaultValue as boolean | undefined,
            )
        case 'Number':
            return variableValueNumberPrompt(
                { value: variation, type: 'variation' },
                defaultValue as number | undefined,
            )
        case 'JSON':
            return variableValueJSONPrompt(
                { value: variation, type: 'variation' },
                defaultValue as string | undefined,
            )
        default:
            return variableValueStringPrompt(
                { value: variation, type: 'variation' },
                defaultValue as string | undefined,
            )
    }
}

export const getVariableCleanupValuePrompt = (
    variable: CleanupVariable,
    variableType: 'String' | 'Boolean' | 'Number' | 'JSON',
) => {
    switch (variableType) {
        case 'Boolean':
            return variableValueBooleanPrompt({
                value: variable,
                type: 'cleanupVariable',
            })
        case 'Number':
            return variableValueNumberPrompt({
                value: variable,
                type: 'cleanupVariable',
            })
        case 'JSON':
            return variableValueJSONPrompt({
                value: variable,
                type: 'cleanupVariable',
            })
        default:
            return variableValueStringPrompt({
                value: variable,
                type: 'cleanupVariable',
            })
    }
}

export const createVariablePrompts: (Prompt | AutoCompletePrompt)[] = [
    namePrompt,
    keyPrompt,
    descriptionPrompt,
    variableTypePrompt,
]
