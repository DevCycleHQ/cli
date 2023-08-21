import { expect } from '@oclif/test'
import { dvcTest } from '../../../test-utils'
import { BASE_URL } from '../../api/common'

describe('features list', () => {
    const projectKey = 'test-project'
    const authFlags = ['--client-id', 'test-client-id', '--client-secret', 'test-client-secret']

    const mockFeatures = [
        {
            key: 'feature-1',
            name: 'Feature 1',
            _id: '61450f3daec96f5cf4a49946'
        },
        {
            key: 'feature-2',
            name: 'Feature 2',
            _id: '61450f3daec96f5cf4a49947',
        }
    ]

    dvcTest()
        .nock(BASE_URL, (api) => api
            .get(`/v1/projects/${projectKey}/features`)
            .reply(200, mockFeatures)
        )
        .stdout()
        .command(['features list', '--project', projectKey, ...authFlags])
        .it('returns a list of feature keys', (ctx) => {
            expect(ctx.stdout).to.contain(JSON.stringify(['feature-1', 'feature-2'], null, 2))
        })

    dvcTest()
        .nock(BASE_URL, (api) => api
            .get(`/v1/projects/${projectKey}/features`)
            .query({ page: 2, perPage: 10 })
            .reply(200, mockFeatures)
        )
        .stdout()
        .command([
            'features list',
            '--project', projectKey,
            '--page', '2',
            '--per-page', '10',
            ...authFlags
        ])
        .it('passes pagination params to api', (ctx) => {
            expect(ctx.stdout).to.contain(JSON.stringify(['feature-1', 'feature-2'], null, 2))
        })
    
    dvcTest()
        .nock(BASE_URL, (api) => api
            .get(`/v1/projects/${projectKey}/features`)
            .query({ search: 'hello world' })
            .reply(200, mockFeatures)
        )
        .stdout()
        .command([
            'features list',
            '--project', projectKey,
            '--search', 'hello world',
            ...authFlags
        ])
        .it('passes search param to api', (ctx) => {
            expect(ctx.stdout).to.contain(JSON.stringify(['feature-1', 'feature-2'], null, 2))
        })
})
