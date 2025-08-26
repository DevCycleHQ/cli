import { expect } from 'vitest'
import { dvcTest, mockFeatures } from '../../../test-utils'
import { AUTH_URL, BASE_URL } from '../../api/common'
import axios from 'axios'
import { tokenCacheStub_get } from '../../../test/setup'

describe('features list', () => {
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
        .command(['features list', '--project', projectKey, ...authFlags])
        .it('returns a list of feature keys', (ctx) => {
            const data = JSON.parse(ctx.stdout)
            expect(data).to.eql(mockFeatures.map((f) => f.key))
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
            'features list',
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
            'features list',
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
})
