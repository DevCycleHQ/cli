import { expect } from 'vitest'
import { dvcTest } from '../../../test-utils'
import { BASE_URL } from '../../api/common'

describe('environments get', () => {
    const projectKey = 'test-project'

    dvcTest()
        .nock(BASE_URL, (api) =>
            api
                .get(`/v1/projects/${projectKey}/environments?perPage=1000&page=1`)
                .reply(200, [
                    { key: 'first-env', name: 'first env' },
                    { key: 'second-env', name: 'second env' },
                ]),
        )
        .stdout()
        .command([
            'environments get',
            '--project',
            projectKey,
            '--client-id',
            'test-client-id',
            '--client-secret',
            'test-client-secret',
        ])
        .it('returns a list of environment objects in headless mode', (ctx) => {
            expect(ctx.stdout).toMatchSnapshot()
        })

    dvcTest()
        .nock(BASE_URL, (api) =>
            api.get(`/v1/projects/${projectKey}/environments/first-env`).reply(200, {
                key: 'first-env',
                name: 'first env',
            }),
        )
        .nock(BASE_URL, (api) =>
            api.get(`/v1/projects/${projectKey}/environments/second-env`).reply(200, {
                key: 'second-env',
                name: 'second env',
            }),
        )
        .stdout()
        .command([
            'environments get',
            '--project',
            projectKey,
            '--client-id',
            'test-client-id',
            '--client-secret',
            'test-client-secret',
            'first-env',
            'second-env',
        ])
        .it('fetches multiple environments by space-separated positional arguments', (ctx) => {
            expect(ctx.stdout).toMatchSnapshot()
        })
})
