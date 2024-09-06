import { CreateFeatureParams } from '../../api/schemas'

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
                status: 'inactive',
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
                status: 'inactive',
            },
        }
    }
