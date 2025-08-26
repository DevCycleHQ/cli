import { expect } from 'vitest'
import { dvcTest, mockFeatures } from '../../../test-utils'
import { AUTH_URL, BASE_URL } from '../../api/common'
import axios from 'axios'
import { tokenCacheStub_get } from '../../../test/setup'

describe('features get', () => {
    const projectKey = 'test-project'
    const authFlags = [
        '--client-id',
        'test-client-id',
        '--client-secret',
        'test-client-secret',
    ]

    dvcTest()
        .do(async () => {
            tokenCacheStub_get.returns('mock-cached-token')
            await axios.post(new URL('/oauth/token', AUTH_URL).href)
        })
        .nock(BASE_URL, (api) =>
            api
                .get(`/v2/projects/${projectKey}/features`)
                .reply(200, mockFeatures),
        )
        .stdout()
        .command(['features get', '--project', projectKey, ...authFlags])
        .it('returns a list of feature objects', (ctx) => {
            const data = JSON.parse(ctx.stdout)
            expect(data).to.eql(mockFeatures)
        })

    dvcTest()
        .do(async () => {
            tokenCacheStub_get.returns('mock-cached-token')
            await axios.post(new URL('/oauth/token', AUTH_URL).href)
        })
        .nock(BASE_URL, (api) =>
            api
                .get(`/v2/projects/${projectKey}/features?page=2&perPage=10`)
                .reply(200, []),
        )
        .stdout()
        .command([
            'features get',
            '--project',
            projectKey,
            '--page',
            '2',
            '--per-page',
            '10',
            ...authFlags,
        ])
        .it('passes pagination params to api', (ctx) => {
            const data = JSON.parse(ctx.stdout)
            expect(data).to.eql([])
        })

    dvcTest()
        .do(async () => {
            tokenCacheStub_get.returns('mock-cached-token')
            await axios.post(new URL('/oauth/token', AUTH_URL).href)
        })
        .nock(BASE_URL, (api) =>
            api
                .get(`/v2/projects/${projectKey}/features?search=search`)
                .reply(200, []),
        )
        .stdout()
        .command([
            'features get',
            '--project',
            projectKey,
            '--search',
            'search',
            ...authFlags,
        ])
        .it('passes search param to api', (ctx) => {
            const data = JSON.parse(ctx.stdout)
            expect(data).to.eql([])
        })

    dvcTest()
        .do(async () => {
            tokenCacheStub_get.returns('mock-cached-token')
            await axios.post(new URL('/oauth/token', AUTH_URL).href)
        })
        .nock(BASE_URL, (api) =>
            api
                .get(`/v2/projects/${projectKey}/features/first-feature`)
                .reply(200, mockFeatures[0]),
        )
        .nock(BASE_URL, (api) =>
            api
                .get(`/v2/projects/${projectKey}/features/second-feature`)
                .reply(200, mockFeatures[1]),
        )
        .stdout()
        .command([
            'features get',
            '--project',
            projectKey,
            ...authFlags,
            'first-feature',
            'second-feature',
        ])
        .it(
            'fetches multiple features by space-separated positional arguments',
            (ctx) => {
                const data = JSON.parse(ctx.stdout)
                expect(data).to.eql([mockFeatures[0], mockFeatures[1]])
            },
        )
})
