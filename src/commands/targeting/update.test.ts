import { expect } from '@oclif/test'
import { dvcTest, setCurrentTestFile } from '../../../test-utils'
import { BASE_URL } from '../../api/common'
import { jestSnapshotPlugin } from 'mocha-chai-jest-snapshot'
import chai from 'chai'
import inquirer from 'inquirer'

describe('targeting update', () => {
    beforeEach(setCurrentTestFile(__filename))
    chai.use(jestSnapshotPlugin())

    const projectKey = 'test-project'
    const authFlags = [
        '--client-id',
        'test-client-id',
        '--client-secret',
        'test-client-secret',
    ]
    const envKey = 'env-key'
    const featureKey = 'feature-key'

    const mockTargetingRule = {
        _id: '6433ca7894d61794nda0d535',
        audience: {
            name: 'All Users',
            filters: {
                operator: 'and',
                filters: [
                    {
                        type: 'all',
                    },
                ],
            },
        },
        distribution: [
            {
                _variation: '647e36gg16c1d4814fe3f962',
                percentage: 1,
            },
        ],
    }

    const mockTargetingRules = [
        {
            targets: [mockTargetingRule],
            readonly: false,
        },
    ]

    const mockEnvironment = {
        _id: '648b421gg3f682869c0f22f8',
        key: envKey,
        name: 'test-env',
        type: 'development',
    }

    const mockVariations = [
        {
            _id: '647e36gg16c1d4814fe3f962',
            key: 'variation-on',
            name: 'Variation On',
            variables: {},
        },
        {
            _id: '647e36gg16d9k5815fc3f963',
            key: 'variation-off',
            name: 'Variation Off',
            variables: {},
        },
    ]

    const headlessRequestBody = {
        targets: [
            {
                distribution: [
                    {
                        _variation: 'variation-on',
                        percentage: 1,
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
    }

    const mockResponseHeadless = {
        _feature: '647e36gg16d9k4815fi3f97d',
        _environment: '648b421gg3f682869c0f22f8',
        _createdBy: 'test',
        status: 'inactive',
        updatedAt: '2023-06-27T03:19:58.541Z',
        targets: [
            {
                _id: '647e36gg16d9k2814fc3f15e',
                audience: {
                    name: 'All Users',
                    filters: {
                        operator: 'and',
                        filters: [
                            {
                                type: 'all',
                            },
                        ],
                    },
                },
                distribution: [
                    {
                        _variation: '647e36gg16c1d4814fe3f962',
                        percentage: 1,
                    },
                ],
            },
        ],
        readonly: false,
    }

    const mockResponseInteractive = {
        _feature: '647e36gg16d9k4815fi3f97d',
        _environment: '648b421gg3f682869c0f22f8',
        _createdBy: 'test',
        status: 'inactive',
        updatedAt: '2023-06-27T03:19:58.541Z',
        targets: [
            {
                distribution: [
                    {
                        _variation: 'variation-off',
                        percentage: 1,
                    },
                ],
                audience: {
                    name: 'All Users New',
                    filters: {
                        filters: [
                            {
                                type: 'all',
                            },
                            {
                                type: 'user',
                                subType: 'user_id',
                                comparator: '=',
                                values: ['not shrek'],
                            },
                        ],
                        operator: 'and',
                    },
                },
            },
        ],
    }

    const interactiveRequestBody = {
        targets: [
            {
                distribution: [
                    {
                        _variation: 'variation-off',
                        percentage: 1,
                    },
                ],
                audience: {
                    name: 'All Users New',
                    filters: {
                        filters: [
                            {
                                type: 'all',
                            },
                            {
                                type: 'user',
                                subType: 'user_id',
                                comparator: '=',
                                values: ['not shrek'],
                            },
                        ],
                        operator: 'and',
                    },
                },
            },
        ],
    }

    dvcTest()
        .nock(BASE_URL, (api) =>
            api
                .get(`/v1/projects/${projectKey}/environments/${envKey}`)
                .reply(200, mockEnvironment),
        )
        .nock(BASE_URL, (api) =>
            api
                .get(
                    `/v1/projects/${projectKey}/features/${featureKey}/variations`,
                )
                .reply(200, mockVariations),
        )
        .nock(BASE_URL, (api) =>
            api
                .patch(
                    `/v1/projects/${projectKey}/features/${featureKey}/configurations`,
                    headlessRequestBody,
                )
                .query({ environment: envKey })
                .reply(200, mockResponseHeadless),
        )
        .nock(BASE_URL, (api) =>
            api.get(`/v1/projects/${projectKey}/audiences`).reply(200, []),
        )
        .stdout()
        .command([
            'targeting update',
            featureKey,
            envKey,
            '--project',
            projectKey,
            ...authFlags,
            '--headless',
            '--targets',
            '[{ "name": "All Users", "serve": "variation-on", "definition": [{ "type": "all" }] }]',
        ])
        .it('updates a target in headless mode', (ctx) => {
            expect(ctx.stdout).toMatchSnapshot()
        })

    dvcTest()
        .stderr()
        .command([
            'targeting update',
            '--project',
            projectKey,
            ...authFlags,
            '--headless',
            '--targets',
            '[{ "name": "All Users", "serve": "variation-on", "definition": [{ "type": "all" }] }]',
        ])
        .it(
            'fails to update a target in headless mode without feature key',
            (ctx) => {
                expect(ctx.stderr).contains(
                    'Feature and environment arguments are required',
                )
            },
        )

    let promptCount = 0
    dvcTest()
        .stub(inquirer, 'registerPrompt', () => {
            return
        })
        .stub(inquirer, 'prompt', () => {
            let promptAnswers
            if (promptCount < 5) {
                promptAnswers = {
                    whichFields: ['targets'],
                    listPromptOption: 'edit',
                    targetListItem: { item: mockTargetingRule, id: 0 },
                    name: 'All Users New',
                    serve: { key: 'variation-off' },
                }
            } else if (promptCount === 5) {
                promptAnswers = {
                    listPromptOption: 'add',
                }
            } else if (promptCount < 9) {
                promptAnswers = {
                    type: 'user',
                    subType: 'user_id',
                    comparator: '=',
                    values: 'not shrek',
                }
            } else {
                promptAnswers = {
                    listPromptOption: 'continue',
                }
            }
            promptCount++
            return promptAnswers
        })
        .nock(BASE_URL, (api) =>
            api
                .get(`/v1/projects/${projectKey}/environments/${envKey}`)
                .reply(200, mockEnvironment),
        )
        .nock(BASE_URL, (api) =>
            api
                .get(
                    `/v1/projects/${projectKey}/features/${featureKey}/variations`,
                )
                .reply(200, mockVariations),
        )
        .nock(BASE_URL, (api) =>
            api
                .get(
                    `/v1/projects/${projectKey}/features/${featureKey}/configurations`,
                )
                .query({ environment: envKey })
                .reply(200, mockTargetingRules),
        )
        .nock(BASE_URL, (api) =>
            api.get(`/v1/projects/${projectKey}/audiences`).reply(200, []),
        )
        .nock(BASE_URL, (api) =>
            api
                .patch(
                    `/v1/projects/${projectKey}/features/${featureKey}/configurations`,
                    interactiveRequestBody,
                )
                .query({ environment: envKey })
                .reply(200, mockResponseInteractive),
        )
        .stdout()
        .command([
            'targeting update',
            featureKey,
            envKey,
            ...authFlags,
            '--project',
            projectKey,
        ])
        .it(
            'updates a target by adding a filter in interactive mode',
            (ctx) => {
                expect(ctx.stdout).toMatchSnapshot()
            },
        )
})
