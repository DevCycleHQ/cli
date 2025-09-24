import { expect } from 'vitest'
import { dvcTest } from '../../../test-utils'
import { BASE_URL } from '../../api/common'
import { tokenCacheStub_get } from '../../../test/setup'

describe('variables get', () => {
    const projectKey = 'test-project'
    const authFlags = [
        '--client-id',
        'test-client-id',
        '--client-secret',
        'test-client-secret',
    ]

    const mockVariables = [
        {
            key: 'variable-1',
            name: 'Variable 1',
            _id: '61450f3daec96f5cf4a49946',
        },
        {
            key: 'variable-2',
            name: 'Variable 2',
            _id: '61450f3daec96f5cf4a49947',
        },
    ]

    dvcTest()
        .do(async () => {
            tokenCacheStub_get.returns('mock-cached-token')
        })
        .nock(BASE_URL, (api) =>
            api
                .get(`/v1/projects/${projectKey}/variables`)
                .reply(200, mockVariables),
        )
        .stdout()
        .command(['variables get', '--project', projectKey, ...authFlags])
        .it('returns a list of variable objects', (ctx) => {
            const data = JSON.parse(ctx.stdout)
            expect(data).to.eql(mockVariables)
        })

    dvcTest()
        .do(async () => {
            tokenCacheStub_get.returns('mock-cached-token')
        })
        .nock(BASE_URL, (api) =>
            api
                .get(`/v1/projects/${projectKey}/variables`)
                .query({ page: 2, perPage: 10 })
                .reply(200, mockVariables),
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
            ...authFlags,
        ])
        .it('passes pagination params to api', (ctx) => {
            const data = JSON.parse(ctx.stdout)
            expect(data).to.eql(mockVariables)
        })

    dvcTest()
        .do(async () => {
            tokenCacheStub_get.returns('mock-cached-token')
        })
        .nock(BASE_URL, (api) =>
            api
                .get(`/v1/projects/${projectKey}/variables`)
                .query({ search: 'search' })
                .reply(200, mockVariables),
        )
        .stdout()
        .command([
            'variables get',
            '--project',
            projectKey,
            '--search',
            'search',
            ...authFlags,
        ])
        .it('passes search param to api', (ctx) => {
            const data = JSON.parse(ctx.stdout)
            expect(data).to.eql(mockVariables)
        })

    dvcTest()
        .do(async () => {
            tokenCacheStub_get.returns('mock-cached-token')
        })
        .nock(BASE_URL, (api) =>
            api
                .get(`/v1/projects/${projectKey}/variables/variable-1`)
                .reply(200, mockVariables[0]),
        )
        .nock(BASE_URL, (api) =>
            api
                .get(`/v1/projects/${projectKey}/variables/variable-2`)
                .reply(200, mockVariables[1]),
        )
        .stdout()
        .command([
            'variables get',
            '--project',
            projectKey,
            ...authFlags,
            'variable-1',
            'variable-2',
        ])
        .it(
            'fetches multiple variables by space-separated positional arguments',
            (ctx) => {
                const data = JSON.parse(ctx.stdout)
                expect(data).to.eql(mockVariables)
            },
        )
})
