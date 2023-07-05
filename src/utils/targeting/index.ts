import { disableTargeting, enableTargeting } from '../../api/targeting'
import inquirer from '../../ui/autocomplete'
import { featurePrompt, EnvironmentPromptResult, environmentPrompt } from '../../ui/prompts'

export const getFeatureAndEnvironmentKeyFromArgs = async (
    authToken: string, 
    projectKey: string,
    args: Record<string, string | undefined>,
    flags: Record<string, string | undefined>
) => {
    const featureKey = args['feature']
    const environmentKey = args['environment']

    const responses = {
        featureKey: featureKey,
        environmentKey: environmentKey
    }

    if (flags.headless && (!featureKey || !environmentKey)) {
        throw new Error('In headless mode, both the feature and environment are required')
    }

    if (!featureKey) {
        const userSelectedFeature = await inquirer.prompt(
            [featurePrompt],
            {
                token: authToken,
                projectKey: projectKey
            }
        )
        responses.featureKey = userSelectedFeature.feature
    }

    if (!environmentKey) {
        const userSelectedEnv = await inquirer.prompt<EnvironmentPromptResult>(
            [environmentPrompt],
            {
                token: authToken,
                projectKey: projectKey
            }
        )
        responses.environmentKey = userSelectedEnv.environment._id
    }

    return responses
}
