import { PromptResult } from './'
import { fetchFeatures } from '../../api/features'
import { Feature } from '../../api/schemas'

type FeatureChoice = {
    name: string,
    value: string
}

export type FeaturePromptResult = {
    feature: FeatureChoice['value']
} & PromptResult

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const featureChoices = async (input: Record<string, any>): Promise<FeatureChoice[]> => {
    const features = await fetchFeatures(input.token, input.projectKey)
    const choices = features.map((feature: Feature) => {
        return {
            name: feature.name || feature.key,
            value: feature._id
        }
    })
    return choices
}

export const featurePrompt = {
    name: 'feature',
    message: 'Which feature?',
    type: 'list',
    choices: featureChoices
}
