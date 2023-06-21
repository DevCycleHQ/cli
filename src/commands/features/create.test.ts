import { expect } from '@oclif/test'
import inquirer from 'inquirer'
import { dvcTest } from '../../../test-utils'
import { BASE_URL } from '../../api/common'

describe('features create', () => {
    const projectKey = 'test-project'
    const authFlags = ['--client-id', 'test-client-id', '--client-secret', 'test-client-secret']
    const requestBody = {
        name: 'Feature Name',
        key: 'feature-key',
        description: undefined,
    }

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
        .stdout()
        .command([
            'features create',
            '--project', projectKey,
            '--name', requestBody.name,
            '--headless',
            ...authFlags
        ])
        .it('Errors when called in headless mode with no key',
            (ctx) => {
                expect(ctx.stdout).to.contain('The key and name flags are required')
            })
    
    dvcTest()
        .nock(BASE_URL, (api) => api
            .post(`/v1/projects/${projectKey}/features`, requestBody)
            .reply(200, mockFeature)
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
        .it('returns a new feature',
            (ctx) => {
                expect(JSON.parse(ctx.stdout)).to.eql(mockFeature)
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
        )
        .stdout()
        .command([
            'features create',
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
        )
        .stdout()
        .command([
            'features create',
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
        }))
        .stdout()
        .command([
            'features create',
            '--project', projectKey,
            ...authFlags
        ])
        .it('returns an error if key is not provided',
            (ctx) => {
                expect(ctx.stdout).to.contain(
                    'Invalid value for key: undefined'
                )
            })
    
    dvcTest()
        .stub(inquirer, 'prompt', () => ({
            key: 'new-key',
            name: undefined,
            description: undefined,
        }))
        .stdout()
        .command([
            'features create',
            '--project', projectKey,
            ...authFlags
        ])
        .it('returns an error if name is not provided',
            (ctx) => {
                expect(ctx.stdout).to.contain(
                    'Invalid value for name: undefined'
                )
            })

    dvcTest()
        .stub(inquirer, 'prompt', () => ({
            key: requestBody.key, 
            description: undefined, 
            listPromptOption: 'continue',
            sdkVisibility: {
                mobile: true,
                client: true,
                server: true
            }
        }))
        .nock(BASE_URL, (api) => api
            .post(`/v1/projects/${projectKey}/features`, {
                ...requestBody,
                variables: [],
                sdkVisibility: {
                    mobile: true,
                    client: true,
                    server: true
                }
            })
            .reply(200, mockFeature)
        )
        .stdout()
        .command([
            'features create',
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
