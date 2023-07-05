import { expect } from '@oclif/test'
import { dvcTest, setCurrentTestFile } from '../../../test-utils'
import { BASE_URL } from '../../api/common'
import { jestSnapshotPlugin } from 'mocha-chai-jest-snapshot'
import chai from 'chai'
import inquirer from 'inquirer'

describe('features update', () => {
    beforeEach(setCurrentTestFile(__filename))
    chai.use(jestSnapshotPlugin())

    const projectKey = 'test-project'
    const authFlags = ['--client-id', 'test-client-id', '--client-secret', 'test-client-secret']

    const testVariables = [
        {
            key: 'string-var',
            type: 'String',
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

    const requestBody = {
        name: 'New Feature Name',
        key: 'new-feature-key',
        description: 'test description',
        sdkVisibility: testSDKVisibility
    }

    const requestBodyWithVariables = {
        ...requestBody,
        variables: testVariables
    }

    // headless mode:
    dvcTest()
        .nock(BASE_URL, (api) => api
            .get(`/v1/projects/${projectKey}/features/${mockFeature.key}`)
            .reply(200, mockFeature)
        )
        .nock(BASE_URL, (api) => api
            .patch(`/v1/projects/${projectKey}/features/${mockFeature.key}`, requestBodyWithVariables)
            .reply(200, mockFeature)
        )
        .stdout()
        .command([
            'features update', mockFeature.key,
            '--project', projectKey,
            '--name', requestBodyWithVariables.name,
            '--key', requestBodyWithVariables.key,
            '--description', requestBody.description,
            '--variables', JSON.stringify(requestBodyWithVariables.variables),
            '--sdkVisibility', JSON.stringify(requestBodyWithVariables.sdkVisibility),
            '--headless',
            ...authFlags
        ])
        .it('updates a feature in headless mode',
            (ctx) => {
                expect(ctx.stdout).toMatchSnapshot()
            }
        )

    dvcTest()
        .stdout()
        .command([
            'features update',
            '--project', projectKey,
            '--name', requestBodyWithVariables.name,
            '--key', requestBodyWithVariables.key,
            '--description', requestBodyWithVariables.description,
            '--variables', JSON.stringify(requestBodyWithVariables.variables),
            '--sdkVisibility', JSON.stringify(requestBodyWithVariables.sdkVisibility),
            '--headless',
            ...authFlags
        ])
        .it('returns an error if key is not provided in headless mode',
            (ctx) => {
                expect(ctx.stdout).to.contain('The key argument is required')
            }
        )

    // interactive mode:
    dvcTest()
        .stub(inquirer, 'prompt', () => ({
            ...requestBody,
            sdkVisibility: ['mobile', 'server'],
            whichFields: Object.keys(requestBody),
            listPromptOption: 'continue',
        }))
        .nock(BASE_URL, (api) => api
            .get(`/v1/projects/${projectKey}/features/${mockFeature.key}`)
            .reply(200, mockFeature)
        )
        .nock(BASE_URL, (api) => api
            .patch(`/v1/projects/${projectKey}/features/${mockFeature.key}`, requestBody)
            .reply(200, mockFeature)
        )
        .stdout()
        .command([
            'features update', mockFeature.key,
            '--project', projectKey,
            ...authFlags
        ])
        .it('updates a feature after prompting for all fields',
            (ctx) => {
                expect(ctx.stdout).toMatchSnapshot()
            }
        )

    dvcTest()
        .stub(inquirer, 'prompt', () => ({
            ...requestBody,
            name: null,
            sdkVisibility: ['mobile', 'server'],
            whichFields: ['key', 'description', 'sdkVisibility'],
            listPromptOption: 'continue',
        }))
        .nock(BASE_URL, (api) => api
            .get(`/v1/projects/${projectKey}/features/${mockFeature.key}`)
            .reply(200, mockFeature)
        )
        .nock(BASE_URL, (api) => api
            .patch(`/v1/projects/${projectKey}/features/${mockFeature.key}`, requestBody)
            .reply(200, mockFeature)
        )
        .stdout()
        .command([
            'features update', mockFeature.key,
            '--name', requestBody.name,
            '--project', projectKey,
            ...authFlags
        ])
        .it('accepts flags and prompts for missing fields',
            (ctx) => {
                expect(ctx.stdout).toMatchSnapshot()
            }
        )
})
