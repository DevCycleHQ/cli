import { Variation } from "../../api/schemas"
import { fetchVariations } from "../../api/variations"

type VariationChoice = {
    name: string,
    value: Variation
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

export const variationPrompt = {
    name: 'variation',
    message: 'Which variation?',
    type: 'list',
    choices: variationChoices
}