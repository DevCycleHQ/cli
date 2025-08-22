import { expect } from 'vitest'
import { dvcTest } from '../../../test-utils'
import { BASE_URL } from '../../api/common'

describe('features get', () => {
    const projectKey = 'test-project'

    dvcTest()
        .nock(BASE_URL, (api) =>
            api
                .get(`/v1/projects/${projectKey}/features?perPage=1000&page=1`)
                .reply(200, [
                    {
                        key: 'first-feature',
                        name: 'first feature',
                    },
                    {
                        key: 'second-feature',
                        name: 'second feature',
                    },
                ]),
        )
        .stdout()
        .command([
            'features get',
            '--project',
            projectKey,
            '--client-id',
            'test-client-id',
            '--client-secret',
            'test-client-secret',
        ])
        .it('returns a list of feature objects', (ctx) => {
            expect(ctx.stdout).toMatchSnapshot()
        })

    dvcTest()
        .nock(BASE_URL, (api) =>
            api
                .get(`/v1/projects/${projectKey}/features?perPage=10&page=2`)
                .reply(200, []),
        )
        .stdout()
        .command([
            'features get',
            '--project',
            projectKey,
            '--page',
            '2',
            '--perPage',
            '10',
            '--client-id',
            'test-client-id',
            '--client-secret',
            'test-client-secret',
        ])
        .it('passes pagination params to api', (ctx) => {
            expect(ctx.stdout).toMatchSnapshot()
        })

    dvcTest()
        .nock(BASE_URL, (api) =>
            api
                .get(
                    `/v1/projects/${projectKey}/features?search=search&perPage=1000&page=1`,
                )
                .reply(200, []),
        )
        .stdout()
        .command([
            'features get',
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
            expect(ctx.stdout).toMatchSnapshot()
        })

    dvcTest()
        .nock(BASE_URL, (api) =>
            api
                .get(`/v1/projects/${projectKey}/features/first-feature`)
                .reply(200, {
                    key: 'first-feature',
                    name: 'first feature',
                }),
        )
        .nock(BASE_URL, (api) =>
            api
                .get(`/v1/projects/${projectKey}/features/second-feature`)
                .reply(200, {
                    key: 'second-feature',
                    name: 'second feature',
                }),
        )
        .stdout()
        .command([
            'features get',
            '--project',
            projectKey,
            '--client-id',
            'test-client-id',
            '--client-secret',
            'test-client-secret',
            'first-feature',
            'second-feature',
        ])
        .it(
            'fetches multiple features by space-separated positional arguments',
            (ctx) => {
                expect(ctx.stdout).toMatchSnapshot()
            },
        )
})
