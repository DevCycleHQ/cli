import { PromptResult } from './'
import { fetchFeatures } from '../../api/features'
import { Feature } from '../../api/schemas'
import { autocompleteSearch } from '../autocomplete'

export type FeatureChoice = {
    name: string,
    value: Feature
}

export type FeaturePromptResult = {
    feature: FeatureChoice['value']
} & PromptResult

let choices: FeatureChoice[]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const featureChoices = async (input: Record<string, any>, search: string): Promise<FeatureChoice[]> => {
    if (!choices) {
        const features = await fetchFeatures(input.token, input.projectKey)
        choices = features.map((feature: Feature) => {
            return {
                name: feature.name || feature.key,
                value: feature
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

export const variableFeaturePrompt = {
    ...featurePrompt,
    transformResponse: (response: Feature) => response.key,
    name: '_feature',
}

type SDKVisibilityChoice = {
    name: string,
    value: 'mobile' | 'client' | 'server',
    checked: boolean
}

export const getSDKVisibilityChoices = (sdkVisibility?: Feature['sdkVisibility']): SDKVisibilityChoice[] => {
    return [
        {
            name: 'mobile',
            value: 'mobile',
            checked: typeof sdkVisibility?.mobile !== 'undefined' ? sdkVisibility?.mobile : false
        },
        {
            name: 'client',
            value: 'client',
            checked: typeof sdkVisibility?.client !== 'undefined' ? sdkVisibility?.client : false
        },
        {
            name: 'server',
            value: 'server',
            checked: typeof sdkVisibility?.server !== 'undefined' ? sdkVisibility?.server : true
        },
    ]
}

export const getSdkVisibilityPrompt = (feature?: Feature) => {
    return {
        name: 'sdkVisibility',
        message: 'Which SDKs should this feature be visible to?',
        type: 'checkbox',
        choices: getSDKVisibilityChoices(feature?.sdkVisibility),
        transformResponse: (response: string[]) => ({
            mobile: response.includes('mobile'),
            client: response.includes('client'),
            server: response.includes('server')
        })
    }
}
