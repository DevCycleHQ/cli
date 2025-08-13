import { expect } from '@oclif/test'
import inquirer from 'inquirer'
import { dvcTest } from '../../../test-utils'
import { BASE_URL } from '../../api/common'

describe('variables create', () => {
    const projectKey = 'test-project'
    const authFlags = [
        '--client-id',
        'test-client-id',
        '--client-secret',
        'test-client-secret',
    ]
    const featureId = '646f8bb69302b0862fd68a39'
    const requestBody = {
        name: 'SPAM SPAM SPAM',
        key: 'spam',
        type: 'String',
    }
    const mockVariable = {
        _id: '648a0d55c4e88cd4c4544c58',
        _project: '63b5ee5de6e91987bae47f01',
        name: 'SPAM SPAM SPAM',
        key: 'spam',
        description: 'spammity spam ',
        type: 'String',
        status: 'active',
        source: 'cli',
        _createdBy: 'google-oauth2|111559006563333334214',
        createdAt: '2023-06-14T18:56:21.270Z',
        updatedAt: '2023-06-14T18:56:21.270Z',
    }
    const variableRequestBody = {
        _feature: featureId,
        key: mockVariable.key,
        type: mockVariable.type,
        name: mockVariable.name,
    }
    const mockFeature = {
        key: 'spam',
        variables: [mockVariable],
        variations: [
            {
                _id: 'variation-1-id',
                key: 'variation-on',
                name: 'Variation On',
                variables: {
                    spam: 'ayyy',
                },
            },
            {
                _id: 'variation-1-id',
                key: 'variation-off',
                name: 'Variation Off',
                variables: {
                    spam: 'lmao',
                },
            },
        ],
        name: 'Test Feature',
        description: 'A test feature for variable creation',
        _id: featureId,
        _project: projectKey,
        source: 'api',
        type: 'release',
        _createdBy: 'test-user',
        createdAt: '2023-06-14T18:56:21.270Z',
        updatedAt: '2023-06-14T18:56:21.270Z',
        controlVariation: 'variation-off',
        readonly: false,
        sdkVisibility: {
            mobile: true,
            client: true,
            server: true,
        },
        settings: {},
    }
    // Headless mode
    dvcTest()
        .nock(BASE_URL, (api) =>
            api
                .post(`/v1/projects/${projectKey}/variables`, requestBody)
                .reply(200, mockVariable),
        )
        .stdout()
        .command([
            'variables create',
            '--project',
            projectKey,
            '--type',
            requestBody.type,
            '--name',
            requestBody.name,
            '--key',
            requestBody.key,
            '--headless',
            ...authFlags,
        ])
        .it('returns a new variable', (ctx) => {
            expect(JSON.parse(ctx.stdout)).to.eql(mockVariable)
        })

    dvcTest()
        .stderr()
        .command([
            'variables create',
            '--project',
            projectKey,
            '--type',
            requestBody.type,
            '--name',
            requestBody.name,
            '--headless',
            ...authFlags,
        ])
        .it('Errors when called in headless mode with no key', (ctx) => {
            expect(ctx.stderr).to.contain(
                'The key, name, and type flags are required',
            )
        })

    dvcTest()
        .nock(BASE_URL, (api) =>
            api
                .post(`/v1/projects/${projectKey}/variables`, requestBody)
                .reply(200, mockVariable),
        )
        .stub(inquirer, 'prompt', () => {
            return {
                key: requestBody.key,
                description: undefined,
                associateToFeature: false,
            }
        })
        .stdout()
        .command([
            'variables create',
            '--project',
            projectKey,
            '--type',
            requestBody.type,
            '--name',
            requestBody.name,
            ...authFlags,
        ])
        .it(
            'prompts for missing key and description, and returns a variable',
            (ctx) => {
                expect(JSON.parse(ctx.stdout)).to.eql(mockVariable)
            },
        )

    dvcTest()
        .nock(BASE_URL, (api) =>
            // Get a feature that has no variables that will be patched with a variable afterwards
            api
                .get(`/v2/projects/${projectKey}/features/${featureId}`)
                .reply(200, {
                    ...mockFeature,
                    variations: mockFeature.variations.map((variation) => ({
                        ...variation,
                        variables: {},
                    })),
                    variables: [],
                })
                .patch(`/v2/projects/${projectKey}/features/spam`, {
                    variables: [variableRequestBody],
                    variations: mockFeature.variations,
                })
                .reply(200, mockFeature),
        )
        .stdout()
        .command([
            'variables create',
            '--project',
            projectKey,
            '--type',
            requestBody.type,
            '--key',
            requestBody.key,
            '--name',
            requestBody.name,
            '--feature',
            featureId,
            '--variations',
            '{"variation-on": "ayyy","variation-off": "lmao"}',
            '--headless',
            ...authFlags,
        ])
        .it(
            'includes _feature in request when user selects to attach to a feature',
            (ctx) => {
                expect(ctx.stdout).to.contain(
                    'The variable was associated to the existing feature spam. Use "dvc features get --keys=spam" to see its details',
                )
            },
        )
})
