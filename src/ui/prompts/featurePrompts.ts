import { PromptResult } from './'
import { fetchFeatures } from '../../api/features'
import { Feature } from '../../api/schemas'
import { autocompleteSearch } from '../autocomplete'

type FeatureChoice = {
    name: string,
    value: string
}

export type FeaturePromptResult = {
    feature: FeatureChoice['value']
} & PromptResult

let choices: { name: string, value: string }[]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const featureChoices = async (input: Record<string, any>, search: string): Promise<FeatureChoice[]> => {
    if (!choices) {
        const features = await fetchFeatures(input.token, input.projectKey)
        choices = features.map((feature: Feature) => {
            return {
                name: feature.name || feature.key,
                value: feature._id
            }
        })
    
    }

    return autocompleteSearch(choices, search)
}

export const featurePrompt = {
    name: 'feature',
    message: 'Which feature?',
    type: 'autocomplete',
    source: featureChoices
}
