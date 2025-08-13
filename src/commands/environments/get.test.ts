import { expect } from '@oclif/test'
import { dvcTest } from '../../../test-utils'
import { BASE_URL } from '../../api/common'

describe('environments get', () => {
    const projectKey = 'test-project'
    const authFlags = [
        '--client-id',
        'test-client-id',
        '--client-secret',
        'test-client-secret',
    ]

    const mockEnvironments = [
        {
            key: 'development',
            name: 'Development',
            _id: '61450f3daec96f5cf4a49960',
        },
        {
            key: 'production',
            name: 'Production',
            _id: '61450f3daec96f5cf4a49961',
        },
    ]

    const mockSingleEnvironment = {
        key: 'test-env',
        name: 'Test Environment',
        _id: '61450f3daec96f5cf4a49962',
    }

    dvcTest()
        .nock(BASE_URL, (api) =>
            api
                .get(`/v1/projects/${projectKey}/environments`)
                .reply(200, mockEnvironments),
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
            expect(ctx.stdout).to.contain(JSON.stringify(mockEnvironments))
        })

    // Test positional arguments functionality
    dvcTest()
        .nock(BASE_URL, (api) =>
            api
                .get(`/v1/projects/${projectKey}/environments/development`)
                .reply(200, mockEnvironments[0])
                .get(`/v1/projects/${projectKey}/environments/production`)
                .reply(200, mockEnvironments[1]),
        )
        .stdout()
        .command([
            'environments get',
            'development',
            'production',
            '--project',
            projectKey,
            ...authFlags,
        ])
        .it(
            'fetches multiple environments by space-separated positional arguments',
            (ctx) => {
                expect(ctx.stdout).to.contain(
                    JSON.stringify(mockEnvironments, null, 2),
                )
            },
        )
})
