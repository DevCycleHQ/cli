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

    const mockSingleFeature = {
        key: 'test-feature',
        name: 'Test Feature',
        _id: '61450f3daec96f5cf4a49950',
        _project: 'test-project',
        source: 'api',
        _createdBy: 'test-user',
        createdAt: '2021-09-15T12:00:00Z',
        updatedAt: '2021-09-15T12:00:00Z',
        variations: [],
        variables: [],
        tags: [],
        configurations: [],
        sdkVisibility: {
            mobile: true,
            client: true,
            server: true,
        },
        settings: {},
        readonly: false,
        controlVariation: 'control',
    }

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

    // Test positional arguments functionality
    dvcTest()
        .nock(BASE_URL, (api) =>
            api
                .get(`/v2/projects/${projectKey}/features/feature-1`)
                .reply(200, mockFeatures[0])
                .get(`/v2/projects/${projectKey}/features/feature-2`)
                .reply(200, mockFeatures[1]),
        )
        .stdout()
        .command([
            'features get',
            'feature-1',
            'feature-2',
            '--project',
            projectKey,
            ...authFlags,
        ])
        .it(
            'fetches multiple features by space-separated positional arguments',
            (ctx) => {
                expect(JSON.parse(ctx.stdout)).to.deep.equal([
                    mockFeatures[0],
                    mockFeatures[1],
                ])
            },
        )
})
