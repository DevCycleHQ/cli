import { Variation } from '../../api/schemas'
import { fetchVariations } from '../../api/variations'
import { fetchVariables } from '../../api/variables'
import { Prompt, keyPrompt, namePrompt } from '../../ui/prompts'
import { Variable } from '../../api/schemas'

import {
    variableValueBooleanPrompt,
    variableValueJSONPrompt,
    variableValueNumberPrompt,
    variableValueStringPrompt
} from './variablePrompts'
import inquirer, { Answers } from 'inquirer'
import chalk from 'chalk'

type VariationChoice = {
    name: string,
    value: Variation
}

export const variationChoices = async (input: Record<string, any>):Promise<VariationChoice[]> => {
    const variations = await fetchVariations(input.token, input.projectKey, input.featureKey)
    const choices = variations.map((variation) => {
        const name = variation.name ? `${variation.name} ${chalk.dim(`(${variation.key})`)}` : variation.key
        return {
            name,
            value: variation
        }
    })
    return choices
}

export const featureVariableChoices = async (authToken: string, projectKey: string, featureKey: string) => {
    const variablesMap = await fetchVariables(authToken, projectKey, { feature: featureKey })
    const choices = []
    for (const variable of variablesMap) {
        const displayVariableType = chalk.dim(`(${variable.type})`)
        const item = { name: `${variable.key} ${displayVariableType}`, value: variable }
        choices.push(item)
    }
    return choices
}

export async function getVariationVariablePrompt(
    authToken: string,
    projectKey: string,
    featureKey: string
): Promise<Prompt> {
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

export function getVariationVariablesPrompts(
    variables: Variable[],
    defaultValues: Record<string, boolean | string | number> = {}
) {
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
    return variablePrompts
}

export async function promptForVariationVariableValues(
    variables: Variable[],
    defaultValues: Record<string, boolean | string | number> = {}
): Promise<Answers> {
    const variablePrompts = getVariationVariablesPrompts(variables, defaultValues)
    const promptAnswers = await inquirer.prompt(variablePrompts, {})
    const variableAnswers: Answers = {}
    for (const [key, value] of Object.entries(promptAnswers)) {
        const variable = variables.find((variable) => variable.key === key)
        if (!variable) continue
        variableAnswers[key] = variable.type === 'JSON' ? JSON.parse(value as string) : value
    }
    return variableAnswers
}

export const staticCreateVariationPrompts: Prompt[] = [
    namePrompt,
    keyPrompt
]
