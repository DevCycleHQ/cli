import { fetchEnvironments } from '../../api/environments'
import { CreateFeatureParams } from '../../api/schemas'
import { updateFeatureConfigForEnvironment } from '../../api/targeting'

// Default variations and variables depending on the key and name provided for quick create
export const mergeQuickFeatureParamsWithAnswers = (
    answers: Record<string, string>,
): CreateFeatureParams => {
    return {
        name: answers.name,
        key: answers.key,
        description: answers.description,
        variables: [
            {
                name: answers.name,
                key: answers.key,
                type: 'Boolean',
            },
        ],
        variations: [
            {
                key: 'variation-on',
                name: 'Variation On',
                variables: { [answers.key]: true },
            },
            {
                key: 'variation-off',
                name: 'Variation Off',
                variables: { [answers.key]: false },
            },
        ],
    }
}

// Setup targeting for all environments and turn on development only
export const setupTargetingForEnvironments = async (
    authToken: string,
    projectKey: string,
    featureKey: string,
) => {
    const environments = await fetchEnvironments(authToken, projectKey)
    await Promise.all(
        environments.map((environment) =>
            updateFeatureConfigForEnvironment(
                authToken,
                projectKey,
                featureKey,
                environment.key,
                {
                    targets:
                        environment.type !== 'development'
                            ? []
                            : [
                                  {
                                      distribution: [
                                          {
                                              percentage: 1,
                                              _variation: 'variation-on',
                                          },
                                      ],
                                      audience: {
                                          name: 'All Users',
                                          filters: {
                                              filters: [
                                                  {
                                                      type: 'all',
                                                  },
                                              ],
                                              operator: 'and',
                                          },
                                      },
                                  },
                              ],
                    status:
                        environment.type === 'development'
                            ? 'active'
                            : 'inactive',
                },
            ),
        ),
    )
}
