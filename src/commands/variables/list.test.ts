import { expect } from 'vitest'
import { dvcTest } from '../../../test-utils'
import { AUTH_URL, BASE_URL } from '../../api/common'
import axios from 'axios'
import { tokenCacheStub_get } from '../../../test/setup'

describe('variables list', () => {
    const projectKey = 'test-project'
    const expectedVariableKeys = ['first-variable', 'second-variable']
    const expectedVariables = [
        { key: 'first-variable', name: 'first variable', type: 'String' },
        { key: 'second-variable', name: 'second variable', type: 'String' },
    ]

    dvcTest()
        .do(async () => {
            tokenCacheStub_get.returns('mock-cached-token')
            await axios.post(new URL('/oauth/token', AUTH_URL).href)
        })
        .nock(BASE_URL, (api) =>
            api
                .get(`/v1/projects/${projectKey}/variables`)
                .reply(200, expectedVariables),
        )
        .stdout()
        .command([
            'variables list',
            '--project',
            projectKey,
            '--client-id',
            'test-client-id',
            '--client-secret',
            'test-client-secret',
        ])
        .it('returns a list of variable keys', (ctx) => {
            const data = JSON.parse(ctx.stdout)
            expect(data).to.eql(expectedVariableKeys)
        })

    dvcTest()
        .do(async () => {
            tokenCacheStub_get.returns('mock-cached-token')
            await axios.post(new URL('/oauth/token', AUTH_URL).href)
        })
        .nock(BASE_URL, (api) =>
            api
                .get(`/v1/projects/${projectKey}/variables?perPage=10&page=2`)
                .reply(200, []),
        )
        .stdout()
        .command([
            'variables list',
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
            await axios.post(new URL('/oauth/token', AUTH_URL).href)
        })
        .nock(BASE_URL, (api) =>
            api
                .get(`/v1/projects/${projectKey}/variables?search=search`)
                .reply(200, []),
        )
        .stdout()
        .command([
            'variables list',
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
})
