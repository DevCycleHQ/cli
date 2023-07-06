import { expect } from '@oclif/test'
import { replaceIdsInTargetingWithNames } from '.'

describe.only('Audience Utils Test', () => {

    const audiences = [
        {
            _id: '1',
            name: 'Audience 1'
        },
        {
            _id: '2',
            name: 'Audience 2'
        },
    ]
    const featureConfigs = [
        {
            '_feature': 'feature-id',
            '_environment': 'environment-id',
            '_createdBy': 'test',
            'status': 'active',
            'startedAt': '2023-07-05T19:43:45.076Z',
            'updatedAt': '2023-07-05T19:50:06.329Z',
            'targets': [
                {
                    '_id': '64a5c96e710da6dc8604994a',
                    'name': 'Test Target',
                    'audience': {
                        'name': 'Test Audience',
                        'filters': {
                            'operator': 'and',
                            'filters': [
                                {
                                    'type': 'audienceMatch',
                                    '_audiences': [
                                        '1'
                                    ],
                                    'comparator': '='
                                },
                                {
                                    'type': 'user',
                                    'subType': 'email',
                                    'values': [
                                        'new@email.com'
                                    ],
                                    'comparator': '='
                                }
                            ]
                        }
                    },
                    'distribution': [
                        {
                            '_variation': '649f2ed02e588411dce577a9',
                            'percentage': 1
                        }
                    ]
                }
            ],
            'readonly': false
        }
    ]
    it('should replace audience ids with audience names', async () => {
        const newFeatureConfigs = await replaceIdsInTargetingWithNames(featureConfigs as any, audiences as any)
        expect(newFeatureConfigs[0].targets[0].audience.filters.filters[0]._audiences).to.deep.equal(['Audience 1'])
    })

    it('should not replace audience ids if no audience found', async () => {
        const newFeatureConfigs = await replaceIdsInTargetingWithNames(featureConfigs as any, [])
        expect(newFeatureConfigs[0].targets[0].audience.filters.filters[0]._audiences).to.deep.equal(['1'])
    })
})