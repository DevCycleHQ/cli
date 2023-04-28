import { ListQuestion } from 'inquirer'
import { prompt } from 'enquirer'
import { CheckboxQuestion } from 'inquirer'

export function selectMissingVariablesPrompt(
    variables: string[],
): ListQuestion<{ variableKey: string }> {
    return {
        type: 'list',
        name: 'variableKey',
        message: 'Please select the missing variables:',
        choices: variables.map((variable) => ({
            name: variable,
            value: variable,
        })),
    }
}

export function selectActionPrompt(
    variableKey: string,
): ListQuestion<{ action: string }> {
    return {
        type: 'list',
        name: 'action',
        message: `What would you like to do with the variable "${variableKey}"?`,
        choices: [
            { name: 'Create variable', value: 'create_variable' },
            { name: 'Create Feature', value: 'create_feature' },
            { name: 'Associate with existing feature', value: 'associate' },
        ],
    }
}

export function inputVariableTypePrompt(): ListQuestion<{
    type: 'String' | 'Boolean' | 'Number' | 'JSON'
}> {
    return {
        type: 'list',
        name: 'type',
        message: 'Select the type of the variable:',
        choices: ['String', 'Boolean', 'Number', 'JSON'].map((name) => ({
            name,
            value: name,
        })),
    }
}

async function inputDefaultValuePromptHelper(
    variableType: 'String' | 'Boolean' | 'Number' | 'JSON',
): Promise<string | number | boolean | Record<string, unknown>> {
    const defaultValuePrompt = {
        type: 'input',
        name: 'defaultValue',
        message: 'Enter the default value for the variable:',
        initial: '',
    }

    const { defaultValue: defaultValueString } = await prompt<{
        defaultValue: string
    }>(defaultValuePrompt)

    try {
        switch (variableType) {
            case 'String':
                return defaultValueString
            case 'Number': {
                const numberValue = parseFloat(defaultValueString)
                if (isNaN(numberValue)) {
                    throw new Error('Invalid number value')
                }
                return numberValue
            }
            case 'Boolean':
                if (defaultValueString.toLowerCase() === 'true') {
                    return true
                } else if (defaultValueString.toLowerCase() === 'false') {
                    return false
                } else {
                    throw new Error('Invalid boolean value')
                }
            case 'JSON': {
                const jsonValue = JSON.parse(defaultValueString)
                return jsonValue
            }
            default:
                throw new Error('Invalid variable type')
        }
    } catch (error) {
        console.error('Invalid input, please try again.')
        return inputDefaultValuePromptHelper(variableType)
    }
}

export const inputDefaultValuePrompt = inputDefaultValuePromptHelper
