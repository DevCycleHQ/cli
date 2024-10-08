import { expect } from '@oclif/test'
import { dvcTest, mockFeatures } from '../../../test-utils'
import { BASE_URL } from '../../api/common'

describe('features get', () => {
    const projectKey = 'test-project'
    const authFlags = [
        '--client-id',
        'test-client-id',
        '--client-secret',
        'test-client-secret',
    ]

    const verifyOutput = (output: any[]) => {
        output.forEach((feature: any, index: number) => {
            expect(feature).to.deep.equal(mockFeatures[index])
        })
    }

    dvcTest()
        .nock(BASE_URL, (api) =>
            api
                .get(`/v2/projects/${projectKey}/features`)
                .reply(200, mockFeatures),
        )
        .stdout()
        .command(['features get', '--project', projectKey, ...authFlags])
        .it('returns a list of feature objects', (ctx) => {
            verifyOutput(JSON.parse(ctx.stdout))
        })

    dvcTest()
        .nock(BASE_URL, (api) =>
            api
                .get(`/v2/projects/${projectKey}/features`)
                .query({ page: 2, perPage: 10 })
                .reply(200, mockFeatures),
        )
        .stdout()
        .command([
            'features get',
            '--project',
            projectKey,
            '--page',
            '2',
            '--per-page',
            '10',
            ...authFlags,
        ])
        .it('passes pagination params to api', (ctx) => {
            verifyOutput(JSON.parse(ctx.stdout))
        })

    dvcTest()
        .nock(BASE_URL, (api) =>
            api
                .get(`/v2/projects/${projectKey}/features`)
                .query({ search: 'hello world' })
                .reply(200, mockFeatures),
        )
        .stdout()
        .command([
            'features get',
            '--project',
            projectKey,
            '--search',
            'hello world',
            ...authFlags,
        ])
        .it('passes search param to api', (ctx) => {
            verifyOutput(JSON.parse(ctx.stdout))
        })
})
