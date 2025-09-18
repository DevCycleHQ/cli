import { expect } from 'vitest'
import { dvcTest } from '../../../test-utils'
import { BASE_URL } from '../../api/common'
import { tokenCacheStub_get } from '../../../test/setup'

describe('variables get', () => {
    const projectKey = 'test-project'
    const expectedVariables = [
        { key: 'first-variable', name: 'first variable', type: 'String' },
        { key: 'second-variable', name: 'second variable', type: 'String' },
    ]

    dvcTest()
        .do(async () => {
            tokenCacheStub_get.returns('mock-cached-token')
        })
        .nock(BASE_URL, (api) =>
            api
                .get(`/v1/projects/${projectKey}/variables`)
                .query((q) => {
                    return (
                        (q.page === undefined || String(q.page) === '1') &&
                        (q.perPage === undefined || String(q.perPage) === '100')
                    )
                })
                .reply(200, expectedVariables),
        )
        .stdout()
        .command([
            'variables get',
            '--project',
            projectKey,
            '--client-id',
            'test-client-id',
            '--client-secret',
            'test-client-secret',
        ])
        .it('returns a list of variable objects', (ctx) => {
            const data = JSON.parse(ctx.stdout)
            expect(data).to.eql(expectedVariables)
        })

    dvcTest()
        .do(async () => {
            tokenCacheStub_get.returns('mock-cached-token')
        })
        .nock(BASE_URL, (api) =>
            api
                .get(`/v1/projects/${projectKey}/variables`)
                .query(
                    (q) => String(q.page) === '2' && String(q.perPage) === '10',
                )
                .reply(200, []),
        )
        .stdout()
        .command([
            'variables get',
            '--project',
            projectKey,
            '--page',
            '2',
            '--per-page',
            '10',
            '--client-id',
            'test-client-id',
            '--client-secret',
            'test-client-secret',
        ])
        .it('passes pagination params to api', (ctx) => {
            const data = JSON.parse(ctx.stdout)
            expect(data).to.eql([])
        })

    dvcTest()
        .do(async () => {
            tokenCacheStub_get.returns('mock-cached-token')
        })
        .nock(BASE_URL, (api) =>
            api
                .get(`/v1/projects/${projectKey}/variables`)
                .query((q) => q.search === 'search')
                .reply(200, []),
        )
        .stdout()
        .command([
            'variables get',
            '--project',
            projectKey,
            '--search',
            'search',
            '--client-id',
            'test-client-id',
            '--client-secret',
            'test-client-secret',
        ])
        .it('passes search param to api', (ctx) => {
            const data = JSON.parse(ctx.stdout)
            expect(data).to.eql([])
        })

    dvcTest()
        .do(async () => {
            tokenCacheStub_get.returns('mock-cached-token')
        })
        .nock(BASE_URL, (api) =>
            api
                .get(`/v1/projects/${projectKey}/variables/first-variable`)
                .reply(200, expectedVariables[0]),
        )
        .nock(BASE_URL, (api) =>
            api
                .get(`/v1/projects/${projectKey}/variables/second-variable`)
                .reply(200, expectedVariables[1]),
        )
        .stdout()
        .command([
            'variables get',
            '--project',
            projectKey,
            '--client-id',
            'test-client-id',
            '--client-secret',
            'test-client-secret',
            'first-variable',
            'second-variable',
        ])
        .it(
            'fetches multiple variables by space-separated positional arguments',
            (ctx) => {
                const data = JSON.parse(ctx.stdout)
                expect(data).to.eql(expectedVariables)
            },
        )
})
