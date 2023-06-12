import { Variable } from '../../api/schemas'
import { fetchVariables, variableTypes } from '../../api/variables'
type VariableChoice = {
    name: string,
    value: Variable
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const variableChoices = async (input: Record<string, any>):Promise<VariableChoice[]> => {
    const variables = await fetchVariables(input.token, input.projectKey)
    const choices = variables.map((variable) => {
        return {
            name: variable.name || variable.key,
            value: variable
        }
    })
    return choices
}

export const variablePrompt = {
    name: 'variable',
    message: 'Which variable?',
    type: 'list',
    choices: variableChoices
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

export const variableValuePrompt = {
    name: 'value',
    message: 'Variable value'
}