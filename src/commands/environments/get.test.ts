import { expect } from 'vitest'
import { dvcTest } from '../../../test-utils'
import { BASE_URL } from '../../api/common'
import { tokenCacheStub_get } from '../../../test/setup'

describe('environments get', () => {
    const projectKey = 'test-project'
    const authFlags = [
        '--client-id',
        'test-client-id',
        '--client-secret',
        'test-client-secret',
    ]
    const expectedEnvironments = [
        {
            key: 'development',
            name: 'Development',
            _id: '61450f3daec96f5cf4a49960',
        },
        {
            key: 'production',
            name: 'Production',
            _id: '61450f3daec96f5cf4a49961',
        },
    ]

    dvcTest()
        .nock(BASE_URL, (api) =>
            api
                .get(`/v1/projects/${projectKey}/environments`)
                .reply(200, expectedEnvironments),
        )
        .stdout()
        .command([
            'environments get',
            '--project',
            projectKey,
            '--headless',
            ...authFlags,
        ])
        .it('returns a list of environment objects in headless mode', (ctx) => {
            const data = JSON.parse(ctx.stdout)
            expect(data).to.eql(expectedEnvironments)
        })

    dvcTest()
        .do(async () => {
            tokenCacheStub_get.returns('mock-cached-token')
        })
        .nock(BASE_URL, (api) =>
            api
                .get(`/v1/projects/${projectKey}/environments/development`)
                .reply(200, expectedEnvironments[0]),
        )
        .nock(BASE_URL, (api) =>
            api
                .get(`/v1/projects/${projectKey}/environments/production`)
                .reply(200, expectedEnvironments[1]),
        )
        .stdout()
        .command([
            'environments get',
            '--project',
            projectKey,
            ...authFlags,
            'development',
            'production',
        ])
        .it(
            'fetches multiple environments by space-separated positional arguments',
            (ctx) => {
                const data = JSON.parse(ctx.stdout)
                expect(data).to.eql(expectedEnvironments)
            },
        )
})
