import { fetchEnvironments } from '../../api/environments'
import { fetchFeatures } from '../../api/features'
import {
    fetchFeatureOverridesForUser,
    fetchProjectOverridesForUser,
} from '../../api/overrides'
import { Environment, Feature } from '../../api/schemas'
import { autocompleteSearch } from '../autocomplete'
import { EnvironmentChoice } from './environmentPrompts'
import { FeatureChoice } from './featurePrompts'

type Input = {
    token: string
    projectKey: string
    featureKey?: string
}
export const overridesFeatureChoices = async (
    input: Input,
    search: string,
): Promise<FeatureChoice[]> => {
    const features = await fetchFeatures(input.token, input.projectKey)
    const projectOverrides = await fetchProjectOverridesForUser(
        input.token,
        input.projectKey,
    )

    const choices: FeatureChoice[] = []
    for (const override of projectOverrides) {
        const feature = features.find(
            (feature: Feature) => feature._id === override._feature,
        )
        if (!feature) {
            continue
        }
        if (
            choices.find(
                (choice: FeatureChoice) => choice.value._id === feature._id,
            )
        ) {
            continue
        }
        choices.push({
            name: feature.name || feature.key,
            value: feature,
        })
    }
    return autocompleteSearch(choices, search)
}

export const overridesFeaturePrompt = {
    name: 'feature',
    message: 'Which feature?',
    type: 'autocomplete',
    source: overridesFeatureChoices,
}

export const overridesEnvironmentChoicesForFeature = async (
    input: Input,
    search: string,
): Promise<EnvironmentChoice[]> => {
    const environments = await fetchEnvironments(input.token, input.projectKey)
    if (!input.featureKey) {
        return []
    }
    const featureOverrides = await fetchFeatureOverridesForUser(
        input.token,
        input.projectKey,
        input.featureKey,
    )

    const choices: EnvironmentChoice[] = []
    for (const override of featureOverrides.overrides) {
        const environment = environments.find(
            (environment: Environment) =>
                environment._id === override._environment,
        )
        if (!environment) {
            continue
        }
        choices.push({
            name: environment.name || environment.key,
            value: environment,
        })
    }
    return autocompleteSearch(choices, search)
}

export const overridesEnvironmentPrompt = {
    name: 'environment',
    message: 'Which environment?',
    type: 'autocomplete',
    source: overridesEnvironmentChoicesForFeature,
}
