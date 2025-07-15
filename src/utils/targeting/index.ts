import inquirer from '../../ui/autocomplete'
import {
    featurePrompt,
    EnvironmentPromptResult,
    environmentPrompt,
    FeaturePromptResult,
} from '../../ui/prompts'
import { fetchFeatureByKey } from '../../api/features'
import {
    Feature,
    Environment,
    Variation,
    FeatureConfig,
    UpdateTargetParams,
} from '../../api/schemas'
import { fetchEnvironmentByKey } from '../../api/environments'
import { servePrompt } from '../../ui/prompts/targetingPrompts'
import { updateFeatureConfigForEnvironment } from '../../api/targeting'
import { TargetingListOptions } from '../../ui/prompts/listPrompts/targetingListPrompt'
import Writer from '../../ui/writer'
import { fetchAudiences } from '../../api/audiences'
import { fetchVariations } from '../../api/variations'
import { renderTargetingTree } from '../../ui/targetingTree'

type Response = {
    environmentKey: string
    featureKey: string
    environment: Environment
    feature: Feature
}
export const getFeatureAndEnvironmentKeyFromArgs = async (
    authToken: string,
    projectKey: string,
    args: Record<string, string | undefined>,
    flags: Record<string, string | undefined>,
): Promise<Response> => {
    const featureKey = args['feature']
    const environmentKey = args['environment']
    let feature, environment

    if (flags.headless && (!featureKey || !environmentKey)) {
        throw new Error(
            'In headless mode, both the feature and environment are required',
        )
    }

    if (!featureKey) {
        const userSelectedFeature = await inquirer.prompt<FeaturePromptResult>(
            [featurePrompt],
            {
                token: authToken,
                projectKey: projectKey,
            },
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
                projectKey: projectKey,
            },
        )
        environment = userSelectedEnv.environment
    } else {
        environment = await fetchEnvironmentByKey(
            authToken,
            projectKey,
            environmentKey,
        )
    }

    return {
        environmentKey: environmentKey || environment._id,
        featureKey: featureKey || feature.key,
        environment,
        feature,
    }
}

export const createTargetAndEnable = async (
    targetingRules: UpdateTargetParams[],
    featureKey: string,
    environmentKey: string,
    authToken: string,
    projectKey: string,
    writer: Writer,
    variations?: Variation[],
    environment?: Environment,
) => {
    let updatedFeatureConfig: FeatureConfig | undefined

    const { targetingChoice } = await inquirer.prompt({
        name: 'targetingChoice',
        message:
            'Cannot enable an environment without any targeting rules.' +
            ' Would you like to add a targeting rule?',
        type: 'list',
        choices: [
            {
                name: 'Target All Users',
                value: 'allUsers',
            },
            {
                name: 'Custom Target',
                value: 'custom',
            },
            {
                name: 'Cancel',
                value: 'cancel',
            },
        ],
    })

    if (targetingChoice === 'cancel') {
        return
    }

    const fetchedVariations =
        variations || (await fetchVariations(authToken, projectKey, featureKey))
    const audiences = await fetchAudiences(authToken, projectKey)

    if (targetingChoice === 'allUsers') {
        const { serve } = await inquirer.prompt([servePrompt], {
            token: authToken,
            projectKey: projectKey,
            featureKey,
        })

        updatedFeatureConfig = await updateFeatureConfigForEnvironment(
            authToken,
            projectKey,
            featureKey,
            environmentKey,
            {
                targets: [
                    {
                        distribution: [
                            {
                                percentage: 1,
                                _variation: serve._id,
                            },
                        ],
                        audience: {
                            name: 'All Users',
                            filters: {
                                filters: [{ type: 'all' }],
                                operator: 'and',
                            },
                        },
                    },
                ],
            },
        )
    } else {
        const targetingListPrompt = new TargetingListOptions(
            targetingRules,
            audiences,
            writer,
            authToken,
            projectKey,
            featureKey,
        )
        targetingListPrompt.variations = fetchedVariations
        const newTarget = await targetingListPrompt.promptAddItem()
        updatedFeatureConfig = await updateFeatureConfigForEnvironment(
            authToken,
            projectKey,
            featureKey,
            environmentKey,
            {
                targets: [newTarget.value.item],
            },
        )
    }

    const fetchedEnvironment =
        environment ||
        (await fetchEnvironmentByKey(authToken, projectKey, environmentKey))

    if (updatedFeatureConfig) {
        renderTargetingTree(
            [updatedFeatureConfig],
            [fetchedEnvironment],
            fetchedVariations,
            audiences,
        )
    }

    const { confirm } = await inquirer.prompt({
        name: 'confirm',
        message:
            'Targeting rule added. Would you like to enable the environment now? Y/n',
        type: 'confirm',
    })

    if (confirm) {
        updatedFeatureConfig = await updateFeatureConfigForEnvironment(
            authToken,
            projectKey,
            featureKey,
            environmentKey,
            { status: 'active' },
        )
        if (updatedFeatureConfig) {
            renderTargetingTree(
                [updatedFeatureConfig],
                [fetchedEnvironment],
                fetchedVariations,
                audiences,
            )
        }
    }
    return updatedFeatureConfig
}
