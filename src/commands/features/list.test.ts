import { expect } from 'vitest'
import { dvcTest } from '../../../test-utils'
import { BASE_URL } from '../../api/common'

describe('features list', () => {
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
            'features list',
            '--project',
            projectKey,
            '--client-id',
            'test-client-id',
            '--client-secret',
            'test-client-secret',
        ])
        .it('returns a list of feature keys', (ctx) => {
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
            'features list',
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
            'features list',
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
})
