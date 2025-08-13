import { expect } from '@oclif/test'
import { dvcTest } from '../../../test-utils'
import { BASE_URL } from '../../api/common'

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

    const mockSingleVariable = {
        key: 'test-var',
        name: 'Test Variable',
        _id: '61450f3daec96f5cf4a49948',
    }

    dvcTest()
        .nock(BASE_URL, (api) =>
            api
                .get(`/v1/projects/${projectKey}/variables`)
                .reply(200, mockVariables),
        )
        .stdout()
        .command(['variables get', '--project', projectKey, ...authFlags])
        .it('returns a list of variable objects', (ctx) => {
            expect(ctx.stdout).to.contain(
                JSON.stringify(mockVariables, null, 2),
            )
        })

    dvcTest()
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
            expect(ctx.stdout).to.contain(
                JSON.stringify(mockVariables, null, 2),
            )
        })

    dvcTest()
        .nock(BASE_URL, (api) =>
            api
                .get(`/v1/projects/${projectKey}/variables`)
                .query({ search: 'hello world' })
                .reply(200, mockVariables),
        )
        .stdout()
        .command([
            'variables get',
            '--project',
            projectKey,
            '--search',
            'hello world',
            ...authFlags,
        ])
        .it('passes search param to api', (ctx) => {
            expect(ctx.stdout).to.contain(
                JSON.stringify(mockVariables, null, 2),
            )
        })

    // Test positional arguments functionality
    dvcTest()
        .nock(BASE_URL, (api) =>
            api
                .get(`/v1/projects/${projectKey}/variables/variable-1`)
                .reply(200, mockVariables[0])
                .get(`/v1/projects/${projectKey}/variables/variable-2`)
                .reply(200, mockVariables[1]),
        )
        .stdout()
        .command([
            'variables get',
            'variable-1',
            'variable-2',
            '--project',
            projectKey,
            ...authFlags,
        ])
        .it(
            'fetches multiple variables by space-separated positional arguments',
            (ctx) => {
                expect(ctx.stdout).to.contain(
                    JSON.stringify(mockVariables, null, 2),
                )
            },
        )
})
