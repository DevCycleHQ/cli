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
        configurations: getQuickConfigurations(),
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

export const getQuickConfigurations =
    (): CreateFeatureParams['configurations'] => {
        return {
            development: {
                targets: [
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
                status: 'active',
            },
            staging: {
                targets: [
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
                status: 'active',
            },
            production: {
                targets: [
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
                status: 'active',
            },
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
