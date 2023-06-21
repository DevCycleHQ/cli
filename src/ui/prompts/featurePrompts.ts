import { PromptResult } from './'
import { fetchFeatures } from '../../api/features'
import { Feature } from '../../api/schemas'
import { autocompleteSearch } from '../autocomplete'
import inquirer from 'inquirer'

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

export const variableFeaturePrompt = {
    ...featurePrompt,
    name: '_feature',
}

type SDKVisibilityChoice = {
    name: string,
    value: 'mobile' | 'client' | 'server',
    checked: boolean
}
type SDKVisibilityPromptResult = {
    sdkVisibility: SDKVisibilityChoice['value'][]
}

export const getSDKVisibilityChoices = (sdkVisibility?: Feature['sdkVisibility']): SDKVisibilityChoice[] => {
    return [
        {
            name: 'mobile',
            value: 'mobile',
            checked: sdkVisibility?.mobile || true
        },
        {
            name: 'client',
            value: 'client',
            checked: sdkVisibility?.client || true
        }, 
        {
            name: 'server',
            value: 'server',
            checked: sdkVisibility?.server || true
        },
    ]
}

export const sdkVisibilityPrompt = async (
    sdkVisibility?: Feature['sdkVisibility']
): Promise<Feature['sdkVisibility']> => {
    const response = await inquirer.prompt<SDKVisibilityPromptResult>([{
        name: 'sdkVisibility',
        message: 'Which SDKs should this feature be visible to?',
        type: 'checkbox',
        choices: getSDKVisibilityChoices(sdkVisibility)
    }])
    return {
        mobile: response.sdkVisibility.includes('mobile'),
        client: response.sdkVisibility.includes('client'),
        server: response.sdkVisibility.includes('server')
    }
}