import { expect } from 'vitest'
import { dvcTest } from '../../../test-utils'
import { BASE_URL } from '../../api/common'

describe('variables get', () => {
    const projectKey = 'test-project'

    dvcTest()
        .nock(BASE_URL, (api) =>
            api
                .get(`/v1/projects/${projectKey}/variables?perPage=1000&page=1`)
                .reply(200, [
                    {
                        key: 'first-variable',
                        name: 'first variable',
                        type: 'String',
                    },
                    {
                        key: 'second-variable',
                        name: 'second variable',
                        type: 'String',
                    },
                ]),
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
            expect(ctx.stdout).toMatchSnapshot()
        })

    dvcTest()
        .nock(BASE_URL, (api) =>
            api
                .get(`/v1/projects/${projectKey}/variables?perPage=10&page=2`)
                .reply(200, []),
        )
        .stdout()
        .command([
            'variables get',
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
                    `/v1/projects/${projectKey}/variables?search=search&perPage=1000&page=1`,
                )
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
            expect(ctx.stdout).toMatchSnapshot()
        })

    dvcTest()
        .nock(BASE_URL, (api) =>
            api
                .get(`/v1/projects/${projectKey}/variables/first-variable`)
                .reply(200, {
                    key: 'first-variable',
                    name: 'first variable',
                    type: 'String',
                }),
        )
        .nock(BASE_URL, (api) =>
            api
                .get(`/v1/projects/${projectKey}/variables/second-variable`)
                .reply(200, {
                    key: 'second-variable',
                    name: 'second variable',
                    type: 'String',
                }),
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
        .it('fetches multiple variables by space-separated positional arguments', (ctx) => {
            expect(ctx.stdout).toMatchSnapshot()
        })
})
