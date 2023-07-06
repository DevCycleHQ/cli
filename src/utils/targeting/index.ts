import { disableTargeting, enableTargeting } from '../../api/targeting'
import inquirer from '../../ui/autocomplete'
import {featurePrompt, EnvironmentPromptResult, environmentPrompt, FeaturePromptResult} from '../../ui/prompts'
import { fetchFeatureByKey } from '../../api/features'
import { Feature, Environment } from '../../api/schemas'
import { fetchEnvironmentByKey } from '../../api/environments'

export const getFeatureAndEnvironmentKeyFromArgs = async (
    authToken: string,
    projectKey: string,
    args: Record<string, string | undefined>,
    flags: Record<string, string | undefined>
) => {
    const featureKey = args['feature']
    const environmentKey = args['environment']
    let feature, environment

    if (flags.headless && (!featureKey || !environmentKey)) {
        throw new Error('In headless mode, both the feature and environment are required')
    }

    if (!featureKey) {
        const userSelectedFeature = await inquirer.prompt<FeaturePromptResult>(
            [featurePrompt],
            {
                token: authToken,
                projectKey: projectKey
            }
        )
        feature = userSelectedFeature.feature
    } else {
        feature = await fetchFeatureByKey(authToken, projectKey, featureKey)
        if (!feature) {
            throw new Error(`No feature found for key ${featureKey}`)
        }
    }

    if (!environmentKey) {
        const userSelectedEnv = await inquirer.prompt<EnvironmentPromptResult>(
            [environmentPrompt],
            {
                token: authToken,
                projectKey: projectKey
            }
        )
        environment = userSelectedEnv.environment
    } else {
        environment = await fetchEnvironmentByKey(
            authToken,
            projectKey,
            environmentKey
        )
    }

    return {
        environmentKey: environmentKey || environment._id,
        featureKey: featureKey || feature.key,
        environment,
        feature
    }
}
