import { Feature, fetchFeatures } from '../../api/features'

type FeatureChoice = {
    name: string
    value: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const featureChoices = async (
    input: Record<string, any>,
): Promise<FeatureChoice[]> => {
    const features = await fetchFeatures(input.token, input.projectKey)
    const choices = features.map((feature: Feature) => {
        return {
            name: feature.name || feature.key,
            value: feature._id,
        }
    })
    return choices
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const featureKeyChoices = async (
    input: Record<string, any>,
): Promise<FeatureChoice[]> => {
    const features = await fetchFeatures(input.token, input.projectKey)
    const choices = features.map((feature: Feature) => {
        return {
            name: feature.name || feature.key,
            value: feature.key,
        }
    })
    return choices
}

export const featurePrompt = {
    name: '_feature',
    message: 'Which feature?',
    type: 'list',
    choices: featureChoices,
}

export const featureKeyPrompt = {
    name: 'feature',
    message: 'Which feature?',
    type: 'list',
    choices: featureKeyChoices,
}
