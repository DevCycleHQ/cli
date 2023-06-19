import { Variation } from "../../api/schemas"
import { fetchVariations } from "../../api/variations"
import { fetchVariables } from "../../api/variables"
import {
    variableValueBooleanPrompt,
    variableValueJSONPrompt,
    variableValueNumberPrompt,
    variableValueStringPrompt
} from "./variablePrompts";
import inquirer, {ListQuestion, Question} from "inquirer";

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

export const variableChoices = async (input: Record<string, any>):Promise<any[]> => {
    const variablesMap = await fetchVariables(input.token, input.projectKey, input.featureKey)
    const choices = []
    for (const variable of variablesMap) {
        const item = { name: variable.key, value: variable }
        choices.push(item)
    }
    return choices
}

export const variationPrompt = {
    name: 'variation',
    message: 'Which variation?',
    type: 'list',
    choices: variationChoices
}

export async function getUpdateVariablesPrompt(
    authToken: string,
    projectKey: string,
    featureKey: string,
    variableValues: Record<string, boolean | string | number>
) {
    const choices = await getVariationVariableValuePrompts(authToken, projectKey, featureKey, variableValues)
    return {
        name: 'variables',
        type: 'list',
        choices: choices
    }
}

export async function getVariationVariableValuePrompts(
    authToken: string,
    projectKey: string,
    featureKey: string,
    // variablesForFeature: Record<string, unknown>[],
    defaultValues: Record<string, boolean | string | number> = {}
) {
    const variablesForFeature = await fetchVariables(authToken, projectKey, featureKey)
    const variablePrompts = []
    for (const variable of variablesForFeature) {
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
export async function promptVariableAnswers(
    variablePrompts: (Question | ListQuestion)[],
    variables: Record<string, unknown>[]
) {
    const variableAnswers = await inquirer.prompt(variablePrompts, {})

    for (const [key, value] of Object.entries(variableAnswers)) {
        const variable = variables.find((variable) => variable.key === key)
        if (variable && variable.type === 'JSON') {
            variableAnswers[key] = JSON.parse(value as string)
        }
    }
    return variableAnswers
}
