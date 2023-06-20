import { Variation } from '../../api/schemas'
import { fetchVariations } from '../../api/variations'
import { fetchVariables } from '../../api/variables'
import { Prompt } from '../../ui/prompts'
import { Variable } from '../../api/schemas'

import {
    variableValueBooleanPrompt,
    variableValueJSONPrompt,
    variableValueNumberPrompt,
    variableValueStringPrompt
} from './variablePrompts'
import inquirer, { Answers, ListQuestion, Question } from 'inquirer'

type VariationChoice = {
    name: string,
    value: Variation
}

type VariableChoice = {
    name: string,
    value: Record<string, unknown>
}

export const variationChoices = async (input: Record<string, any>):Promise<VariationChoice[]> => {
    const variations = await fetchVariations(input.token, input.projectKey, input.featureKey)
    const choices = variations.map((variation) => {
        return {
            name: variation.name || variation.key,
            value: variation
        }
    })
    return choices
}

export const featureVariableChoices = async (authToken: string, projectKey: string, featureKey: string) => {
    const variablesMap = await fetchVariables(authToken, projectKey, featureKey)
    const choices = []
    for (const variable of variablesMap) {
        const item = { name: variable.key, value: variable }
        choices.push(item)
    }
    return choices
}

export async function getVariationVariablePrompt(authToken: string, projectKey: string, featureKey: string) {
    return {
        name: 'variables',
        message: 'Which variables?',
        type: 'checkbox',
        choices: await featureVariableChoices(authToken, projectKey, featureKey)
    }

}
export const variationPrompt = {
    name: 'variation',
    message: 'Which variation?',
    type: 'list',
    choices: variationChoices
}

export async function getVariationVariableValuePrompts(
    featureKey: string,
    variables: Variable[],
    defaultValues: Record<string, boolean | string | number> = {}
): Promise<Answers> {
    const variablePrompts = []
    for (const variable of variables) {
        switch (variable.type) {
            case 'Boolean':
                variablePrompts.push(
                    variableValueBooleanPrompt(variable.key, defaultValues[variable.key] as boolean | undefined)
                )
                break
            case 'Number':
                variablePrompts.push(
                    variableValueNumberPrompt(variable.key, defaultValues[variable.key] as number | undefined)
                )
                break
            case 'JSON':
                variablePrompts.push(
                    variableValueJSONPrompt(variable.key, defaultValues[variable.key] as string | undefined)
                )
                break
            default:
                variablePrompts.push(
                    variableValueStringPrompt(variable.key, defaultValues[variable.key] as string | undefined)
                )
        }
    }
    const variableAnswers = await inquirer.prompt(variablePrompts, {})

    for (const [key, value] of Object.entries(variableAnswers)) {
        const variable = variables.find((variable) => variable.key === key)
        if (variable && variable.type === 'JSON') {
            variableAnswers[key] = JSON.parse(value as string)
        }
    }
    return variableAnswers
}
