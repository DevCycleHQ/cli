import { expect, vi } from 'vitest'
import { dvcTest } from '../../../test-utils'
import { AUTH_URL, BASE_URL } from '../../api/common'
import axios from 'axios'
import { tokenCacheStub_get } from '../../../test/setup'
import inquirer from 'inquirer'

describe('features update', () => {
    const projectKey = 'test-project'
    const authFlags = [
        '--client-id',
        'test-client-id',
        '--client-secret',
        'test-client-secret',
    ]

    const testVariables = [
        {
            key: 'string-var',
            type: 'String',
        },
    ]

    const mockFeature = {
        name: 'Feature Name',
        key: 'feature-key',
        _id: 'id',
        _project: 'string',
        source: 'api',
        _createdBy: 'string',
        createdAt: '2019-08-24T14:15:22Z',
        updatedAt: '2019-08-24T14:15:22Z',
        variations: [],
        variables: [],
        tags: [],
        ldLink: 'string',
        readonly: true,
        sdkVisibility: {
            mobile: true,
            client: true,
            server: true,
        },
        settings: {},
        controlVariation: 'variation_id',
    }

    const testSDKVisibility = {
        mobile: true,
        client: false,
        server: true,
    }

    const requestBody = {
        name: 'New Feature Name',
        key: 'new-feature-key',
        description: 'test description',
        sdkVisibility: testSDKVisibility,
    }

    const requestBodyWithVariations = {
        ...requestBody,
        variations: [],
    }

    const requestBodyWithVariables = {
        ...requestBody,
        variables: testVariables,
    }

    // headless mode:
    dvcTest()
        .do(async () => {
            tokenCacheStub_get.returns('mock-cached-token')
            await axios.post(new URL('/oauth/token', AUTH_URL).href)
        })
        .nock(BASE_URL, (api) =>
            api
                .get(`/v2/projects/${projectKey}/features/${mockFeature.key}`)
                .reply(200, mockFeature),
        )
        .nock(BASE_URL, (api) =>
            api
                .patch(
                    `/v2/projects/${projectKey}/features/${mockFeature.key}`,
                    requestBodyWithVariables,
                )
                .reply(200, mockFeature),
        )
        .stdout()
        .command([
            'features update',
            mockFeature.key,
            '--project',
            projectKey,
            '--name',
            requestBodyWithVariables.name,
            '--key',
            requestBodyWithVariables.key,
            '--description',
            requestBody.description,
            '--variables',
            JSON.stringify(requestBodyWithVariables.variables),
            '--sdkVisibility',
            JSON.stringify(requestBodyWithVariables.sdkVisibility),
            '--headless',
            ...authFlags,
        ])
        .it('updates a feature in headless mode', (ctx) => {
            expect(ctx.stdout).toMatchSnapshot()
        })

    let stderrSpy: ReturnType<typeof vi.spyOn> | undefined
    let consoleErrorSpy: ReturnType<typeof vi.spyOn> | undefined
    dvcTest()
        .do(async () => {
            tokenCacheStub_get.returns('mock-cached-token')
            await axios.post(new URL('/oauth/token', AUTH_URL).href)
            stderrSpy = vi.spyOn(process.stderr, 'write' as any)
            consoleErrorSpy = vi.spyOn(console, 'error')
        })
        .stdout()
        .stderr()
        .command([
            'features update',
            '--project',
            projectKey,
            '--name',
            requestBodyWithVariables.name,
            '--description',
            requestBodyWithVariables.description,
            '--variables',
            JSON.stringify(requestBodyWithVariables.variables),
            '--sdkVisibility',
            JSON.stringify(requestBodyWithVariables.sdkVisibility),
            '--headless',
            ...authFlags,
        ])
        .it('returns an error if key is not provided in headless mode', () => {
            const stderrCalls = (stderrSpy?.mock.calls || []).flat().join('')
            const consoleErrCalls = (consoleErrorSpy?.mock.calls || [])
                .flat()
                .join(' ')
            const combined = `${stderrCalls}${consoleErrCalls}`
            expect(combined).toContain('The key argument is required')
            stderrSpy?.mockRestore()
            consoleErrorSpy?.mockRestore()
        })

    // interactive mode:
    dvcTest()
        .do(async () => {
            tokenCacheStub_get.returns('mock-cached-token')
            await axios.post(new URL('/oauth/token', AUTH_URL).href)
        })
        .stub(inquirer, 'prompt', () => ({
            ...requestBodyWithVariations,
            sdkVisibility: ['mobile', 'server'],
            whichFields: Object.keys(requestBodyWithVariations),
            listPromptOption: 'continue',
        }))
        .nock(BASE_URL, (api) =>
            api
                .get(`/v2/projects/${projectKey}/features/${mockFeature.key}`)
                .reply(200, mockFeature),
        )
        .nock(BASE_URL, (api) =>
            api
                .patch(
                    `/v2/projects/${projectKey}/features/${mockFeature.key}`,
                    requestBodyWithVariations,
                )
                .reply(200, mockFeature),
        )
        .stdout()
        .command([
            'features update',
            mockFeature.key,
            '--project',
            projectKey,
            ...authFlags,
        ])
        .it('updates a feature after prompting for all fields', (ctx) => {
            expect(ctx.stdout).toMatchSnapshot()
        })

    dvcTest()
        .do(async () => {
            tokenCacheStub_get.returns('mock-cached-token')
            await axios.post(new URL('/oauth/token', AUTH_URL).href)
        })
        .stub(inquirer, 'prompt', () => ({
            ...requestBody,
            name: null,
            sdkVisibility: ['mobile', 'server'],
            whichFields: ['key', 'description', 'sdkVisibility'],
            listPromptOption: 'continue',
        }))
        .nock(BASE_URL, (api) =>
            api
                .get(`/v2/projects/${projectKey}/features/${mockFeature.key}`)
                .reply(200, mockFeature),
        )
        .nock(BASE_URL, (api) =>
            api
                .patch(
                    `/v2/projects/${projectKey}/features/${mockFeature.key}`,
                    requestBody,
                )
                .reply(200, mockFeature),
        )
        .stdout()
        .command([
            'features update',
            mockFeature.key,
            '--name',
            requestBody.name,
            '--project',
            projectKey,
            ...authFlags,
        ])
        .it('accepts flags and prompts for missing fields', (ctx) => {
            expect(ctx.stdout).toMatchSnapshot()
        })
})
