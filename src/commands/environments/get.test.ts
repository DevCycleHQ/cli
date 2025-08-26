import { expect } from 'vitest'
import { dvcTest } from '../../../test-utils'
import { AUTH_URL, BASE_URL } from '../../api/common'
import axios from 'axios'
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
        { key: 'first-env', name: 'first env' },
        { key: 'second-env', name: 'second env' },
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
            await axios.post(new URL('/oauth/token', AUTH_URL).href)
        })
        .nock(BASE_URL, (api) =>
            api
                .get(`/v1/projects/${projectKey}/environments/first-env`)
                .reply(200, expectedEnvironments[0]),
        )
        .nock(BASE_URL, (api) =>
            api
                .get(`/v1/projects/${projectKey}/environments/second-env`)
                .reply(200, expectedEnvironments[1]),
        )
        .stdout()
        .command([
            'environments get',
            '--project',
            projectKey,
            ...authFlags,
            'first-env',
            'second-env',
        ])
        .it(
            'fetches multiple environments by space-separated positional arguments',
            (ctx) => {
                const data = JSON.parse(ctx.stdout)
                expect(data).to.eql(expectedEnvironments)
            },
        )
})
