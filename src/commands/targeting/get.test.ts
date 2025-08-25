import { expect } from 'vitest'
import inquirer from 'inquirer'
import { dvcTest, setCurrentTestFile } from '../../../test-utils'
import { AUTH_URL, BASE_URL } from '../../api/common'
import axios from 'axios'
import { tokenCacheStub_get } from '../../../test/setup'

describe('targeting get', () => {
    beforeEach(setCurrentTestFile(__filename))

    const projectKey = 'test-project'
    const featureKey = 'test-feature'
    const authFlags = [
        '--project',
        projectKey,
        '--client-id',
        'test-client-id',
        '--client-secret',
        'test-client-secret',
    ]

    const mockTargeting = [
        {
            _feature: '642d9de38bbfc09ad0657e05',
            _environment: '637cfe8195279288bc08cb61',
            _createdBy: 'google-oauth2|112946554154333301873',
            status: 'active',
            startedAt: '2023-04-05T16:12:19.911Z',
            updatedAt: '2023-04-05T16:12:19.922Z',
            targets: [],
        },
    ]

    dvcTest()
        .do(async () => {
            tokenCacheStub_get.returns('mock-cached-token')
            await axios.post(new URL('/oauth/token', AUTH_URL).href)
        })
        .nock(BASE_URL, (api) =>
            api
                .get(
                    `/v1/projects/${projectKey}/features/${featureKey}/configurations`,
                )
                .reply(200, mockTargeting),
        )
        .stdout()
        .command(['targeting get', featureKey, '--headless', ...authFlags])
        .it('returns all targeting for a feature', (ctx) => {
            expect(ctx.stdout).toMatchSnapshot()
        })

    dvcTest()
        .do(async () => {
            tokenCacheStub_get.returns('mock-cached-token')
            await axios.post(new URL('/oauth/token', AUTH_URL).href)
        })
        .nock(BASE_URL, (api) =>
            api
                .get(
                    `/v1/projects/${projectKey}/features/${featureKey}/configurations?environment=test-env`,
                )
                .reply(200, mockTargeting),
        )
        .stdout()
        .command([
            'targeting get',
            featureKey,
            'test-env',
            '--headless',
            ...authFlags,
        ])
        .it('includes environment in query params', (ctx) => {
            expect(ctx.stdout).toMatchSnapshot()
        })

    dvcTest()
        .stub(inquirer, 'prompt', () =>
            Promise.resolve({ feature: { key: 'another-feature' } }),
        )
        .do(async () => {
            tokenCacheStub_get.returns('mock-cached-token')
            await axios.post(new URL('/oauth/token', AUTH_URL).href)
        })
        .nock(BASE_URL, (api) =>
            api.get(`/v1/projects/${projectKey}/environments`).reply(200, []),
        )
        .nock(BASE_URL, (api) =>
            api
                .get(
                    `/v1/projects/${projectKey}/features/another-feature/variations`,
                )
                .reply(200, []),
        )
        .nock(BASE_URL, (api) =>
            api.get(`/v1/projects/${projectKey}/audiences`).reply(200, []),
        )
        .nock(BASE_URL, (api) =>
            api
                .get(
                    `/v1/projects/${projectKey}/features/another-feature/configurations`,
                )
                .reply(200, mockTargeting),
        )
        .stdout()
        .command(['targeting get', ...authFlags])
        .it('uses prompts when feature is not provided', (ctx) => {
            expect(ctx.stdout).toMatchSnapshot()
        })
})
