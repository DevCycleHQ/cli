import { expect } from '@oclif/test'
import inquirer from 'inquirer'
import { dvcTest } from '../../../test-utils'
import { BASE_URL } from '../../api/common'
import { mergeQuickFeatureParamsWithAnswers } from '../../utils/features/quickCreateFeatureUtils'

describe('features create', () => {
    const projectKey = 'test-project'
    const authFlags = ['--client-id', 'test-client-id', '--client-secret', 'test-client-secret']
    const requestBody = {
        name: 'Feature Name',
        key: 'feature-key',
        description: undefined,
    }

    const mockProject = {
        name: 'Test Project',
        key: projectKey,
        settings: {
            sdkTypeVisibility: {
                enabledInFeatureSettings: false,
            }
        }
    }

    const mockEnvironments = [
        {
            key: 'development',
            name: 'Development',
            _id: '647f62ae749bbe90fb222070'
        },
        {
            key: 'staging',
            name: 'Staging',
            _id: '637cfe8195279288bc08cb62'
        },
        {
            key: 'production',
            name: 'Production',
            _id: '637cfe8195279288bc08cb61'
        }
    ]

    const mockFeature = {
        'name': 'Feature Name',
        'key': 'feature-key',
        '_id': 'id',
        '_project': 'string',
        'source': 'api',
        '_createdBy': 'string',
        'createdAt': '2019-08-24T14:15:22Z',
        'updatedAt': '2019-08-24T14:15:22Z',
        'variations': [],
        'variables': [],
        'tags': [],
        'ldLink': 'string',
        'readonly': true,
        'sdkVisibility': {
            'mobile': true,
            'client': true,
            'server': true
        }
    }

    const testSDKVisibility = {
        mobile: true,
        client: false,
        server: true
    }

    const testVariables = [
        {
            key: 'string-var',
            type: 'String',
        }
    ]

    // Headless mode
    dvcTest()
        .stderr()
        .command([
            'features create',
            '--project', projectKey,
            '--name', requestBody.name,
            '--headless',
            ...authFlags
        ])
        .it('Errors when called in headless mode with no key', (ctx) => {
            expect(ctx.stderr).to.contain('The key and name flags are required')
        })
    
    dvcTest()
        .nock(BASE_URL, (api) => api
            .post(`/v1/projects/${projectKey}/features`, requestBody)
            .reply(200, mockFeature)
            .get(`/v1/projects/${projectKey}`)
            .reply(200, mockProject)
        )
        .stdout()
        .command([
            'features create',
            '-i',
            '--name', requestBody.name,
            '--key', requestBody.key,
            '--project', projectKey,
            '--headless',
            ...authFlags
        ])
        .it('returns a new feature',
            (ctx) => {
                expect(JSON.parse(ctx.stdout)).to.eql(mockFeature)
            })

    dvcTest()
        .nock(BASE_URL, (api) => api
            .post(`/v1/projects/${projectKey}/features`)
            .reply(200, mockFeature)
            .get(`/v1/projects/${projectKey}/environments`)
            .reply(200, mockEnvironments)
            .patch(`/v1/projects/${projectKey}/features/${requestBody.key}/configurations?environment=development`)
            .reply(200, {})
            .patch(`/v1/projects/${projectKey}/features/${requestBody.key}/configurations?environment=staging`)
            .reply(200, {})
            .patch(`/v1/projects/${projectKey}/features/${requestBody.key}/configurations?environment=production`)
            .reply(200, {})
        )
        .stdout()
        .command([
            'features create',
            '--name', requestBody.name,
            '--key', requestBody.key,
            '--project', projectKey,
            '--headless',
            ...authFlags
        ])
        .it('returns a new feature with quick create',
            (ctx) => {
                const jsonStartIndex = ctx.stdout.indexOf('{')
                const jsonEndIndex = ctx.stdout.lastIndexOf('}')
                const jsonString = ctx.stdout.slice(jsonStartIndex, jsonEndIndex + 1)
                const parsedJson = JSON.parse(jsonString)
                expect(parsedJson).to.eql(mockFeature)
            })

    dvcTest()
        .nock(BASE_URL, (api) => api
            .post(`/v1/projects/${projectKey}/features`, {
                ...requestBody,
                variables: testVariables
            })
            .reply(200, {
                ...mockFeature,
                variables: testVariables
            })
            .get(`/v1/projects/${projectKey}`)
            .reply(200, mockProject)
        )
        .stdout()
        .command([
            'features create',
            '-i',
            '--name', requestBody.name,
            '--key', requestBody.key,
            '--project', projectKey,
            '--variables', JSON.stringify(testVariables),
            '--headless',
            ...authFlags
        ])
        .it('creates a new feature with variables',
            (ctx) => {
                expect(JSON.parse(ctx.stdout)).to.eql({
                    ...mockFeature,
                    variables: testVariables
                })
            })

    dvcTest()
        .nock(BASE_URL, (api) => api
            .post(`/v1/projects/${projectKey}/features`, {
                ...requestBody,
                sdkVisibility: testSDKVisibility
            })
            .reply(200, {
                ...mockFeature,
                sdkVisibility: testSDKVisibility
            })
            .get(`/v1/projects/${projectKey}`)
            .reply(200, mockProject)
        )
        .stdout()
        .command([
            'features create',
            '-i',
            '--name', requestBody.name,
            '--key', requestBody.key,
            '--project', projectKey,
            '--sdkVisibility', '{"mobile": true, "client": false, "server": true}',
            '--headless',
            ...authFlags
        ])
        .it('creates a new feature with sdk visibility',
            (ctx) => {
                expect(JSON.parse(ctx.stdout)).to.eql({
                    ...mockFeature,
                    sdkVisibility: testSDKVisibility
                })
            })

    // Interactive mode
    dvcTest()
        .stub(inquirer, 'prompt', () => ({
            key: undefined,
            name: 'new name',
            description: undefined,
            listPromptOption: 'continue',
        }))
        .nock(BASE_URL, (api) => api
            .get(`/v1/projects/${projectKey}`)
            .reply(200, mockProject)
        )
        .stderr()
        .command([
            'features create',
            '--project', projectKey,
            '-i',
            ...authFlags
        ])
        .catch((err) => null)
        .it('returns an error if key is not provided', (ctx) => {
            expect(ctx.stderr).to.contain('key is a required field')
        })
    
    dvcTest()
        .stub(inquirer, 'prompt', () => ({
            key: 'new-key',
            name: undefined,
            description: undefined,
            listPromptOption: 'continue',
        }))
        .nock(BASE_URL, (api) => api
            .get(`/v1/projects/${projectKey}`)
            .reply(200, mockProject)
        )
        .stderr()
        .command([
            'features create',
            '--project', projectKey,
            '-i',
            ...authFlags
        ])
        .catch((err) => null)
        .it('returns an error if name is not provided', (ctx) => {
            expect(ctx.stderr).to.contain('name is a required field')
        })

    dvcTest()
        .stub(inquirer, 'prompt', () => ({
            key: requestBody.key, 
            description: undefined, 
            listPromptOption: 'continue',
        }))
        .nock(BASE_URL, (api) => api
            .post(`/v1/projects/${projectKey}/features`, {
                ...requestBody,
                variables: [],
                variations: [],
            })
            .reply(200, mockFeature)
            .get(`/v1/projects/${projectKey}`)
            .reply(200, mockProject)
        )
        .stdout()
        .command([
            'features create',
            '-i',
            '--project', projectKey,
            '--name', requestBody.name,
            ...authFlags
        ])
        .it('prompts for missing key and description, and returns a feature',
            (ctx) => {
                // TODO: Use snapshot instead to test the entire output
                const response = ctx.stdout.substring(ctx.stdout.indexOf('{'), ctx.stdout.lastIndexOf('}') + 1)
                expect(JSON.parse(response)).to.eql(mockFeature)
            })

    dvcTest()
        .stub(inquirer, 'registerPrompt', () => { return })
        .stub(inquirer, 'prompt', () => ({ ...requestBody, description: 'new desc' }))
        .nock(BASE_URL, (api) => api
            .post(`/v1/projects/${projectKey}/features`,
                mergeQuickFeatureParamsWithAnswers({ ...requestBody, description: 'new desc' }) as any)
            .reply(200, mockFeature)
            .get(`/v1/projects/${projectKey}/environments`)
            .reply(200, mockEnvironments)
            .patch(`/v1/projects/${projectKey}/features/${requestBody.key}/configurations?environment=development`)
            .reply(200, {})
            .patch(`/v1/projects/${projectKey}/features/${requestBody.key}/configurations?environment=staging`)
            .reply(200, {})
            .patch(`/v1/projects/${projectKey}/features/${requestBody.key}/configurations?environment=production`)
            .reply(200, {})
        )
        .stdout()
        .command([
            'features create',
            '--project', projectKey,
            ...authFlags
        ])
        .it('returns a new feature with quick create not in headless mode',
            (ctx) => {
                const jsonStartIndex = ctx.stdout.indexOf('{')
                const jsonEndIndex = ctx.stdout.lastIndexOf('}')
                const jsonString = ctx.stdout.slice(jsonStartIndex, jsonEndIndex + 1)
                const parsedJson = JSON.parse(jsonString)
                expect(parsedJson).to.eql(mockFeature)
            })
    
    // dvcTest()
    //     .stub(inquirer, 'prompt', () => ({
    //         key: requestBody.key, 
    //         description: undefined, 
    //         listPromptOption: 'add',
    //         // TODO: Add list option specific keys so we can stub the prompt
    //         // e.g. "variable.key", "variable.name" when prompted for the variable key and name
    //     }))
    //     .nock(BASE_URL, (api) => api
    //         .post(`/v1/projects/${projectKey}/features`, {
    //             ...requestBody,
    //             variables: [],
    //         })
    //         .reply(200, mockFeature)
    //     )
    //     .stdout()
    //     .command([
    //         'features create',
    //         '--project', projectKey,
    //         '--name', requestBody.name,
    //         ...authFlags
    //     ])
    //     .it('prompts for missing key and description, and returns a feature',
    //         (ctx) => {
    //             // TODO: Use snapshot instead to test the entire output
    //             const response = ctx.stdout.substring(ctx.stdout.indexOf('{'), ctx.stdout.lastIndexOf('}') + 1)
    //             expect(JSON.parse(response)).to.eql(mockFeature)
    //         })
})
