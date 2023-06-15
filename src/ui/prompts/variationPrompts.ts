import { Variation } from "../../api/schemas"
import { fetchVariations } from "../../api/variations"

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
    const variablesMap = input.variables
    let choices = []
    for (const key in variablesMap) {
        if (Object.hasOwnProperty.call(variablesMap, key)) {
          const item = { name: key, value: variablesMap[key] }
          choices.push(item)
        }
      }
    return choices
}

export const variationPrompt = {
    name: 'variation',
    message: 'Which variation?',
    type: 'list',
    choices: variationChoices
}

export const updateVariableValuePrompt = {
    name: 'variableValue',
    message: 'Which variable?',
    type: 'list',
    choices: variableChoices
}