import { expect } from 'vitest'
import inquirer from 'inquirer'
import { dvcTest, setCurrentTestFile } from '../../../test-utils'
import { BASE_URL } from '../../api/common'

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
        },
    ]

    dvcTest()
        .nock(BASE_URL, (api) =>
            api
                .get(`/v1/projects/${projectKey}/features?perPage=1000&page=1`)
                .reply(200, [
                    { key: 'test-feature' },
                    { key: 'another-feature' },
                ]),
        )
        .nock(BASE_URL, (api) =>
            api
                .get(
                    `/v1/projects/${projectKey}/features/${featureKey}/environments/${projectKey}/targeting`,
                )
                .reply(200, mockTargeting),
        )
        .stdout()
        .command(['targeting get', featureKey, ...authFlags])
        .it('returns all targeting for a feature', (ctx) => {
            expect(ctx.stdout).toMatchSnapshot()
        })

    dvcTest()
        .nock(BASE_URL, (api) =>
            api
                .get(`/v1/projects/${projectKey}/features?perPage=1000&page=1`)
                .reply(200, [
                    { key: 'test-feature' },
                    { key: 'another-feature' },
                ]),
        )
        .nock(BASE_URL, (api) =>
            api
                .get(
                    `/v1/projects/${projectKey}/features/${featureKey}/environments/${projectKey}/targeting?environment=test-env`,
                )
                .reply(200, mockTargeting),
        )
        .stdout()
        .command([
            'targeting get',
            featureKey,
            'test-env',
            ...authFlags,
        ])
        .it('includes environment in query params', (ctx) => {
            expect(ctx.stdout).toMatchSnapshot()
        })

    dvcTest()
        .stub(inquirer, 'prompt', () =>
            Promise.resolve({ feature: 'another-feature' }),
        )
        .nock(BASE_URL, (api) =>
            api
                .get(`/v1/projects/${projectKey}/features?perPage=1000&page=1`)
                .reply(200, [
                    { key: 'test-feature' },
                    { key: 'another-feature' },
                ]),
        )
        .nock(BASE_URL, (api) =>
            api
                .get(
                    `/v1/projects/${projectKey}/features/another-feature/environments/${projectKey}/targeting`,
                )
                .reply(200, mockTargeting),
        )
        .stdout()
        .command(['targeting get', ...authFlags])
        .it('uses prompts when feature is not provided', (ctx) => {
            expect(ctx.stdout).toMatchSnapshot()
        })
})
