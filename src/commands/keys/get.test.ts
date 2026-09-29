import { expect } from 'vitest'
import { dvcTest } from '../../../test-utils'
import { BASE_URL } from '../../api/common'

describe('keys get', () => {
    const projectKey = 'test-project'
    const authFlags = [
        '--client-id',
        'test-client-id',
        '--client-secret',
        'test-client-secret',
    ]

    const serverKeys = [
        {
            key: 'dvc_server_old',
            createdAt: '2024-01-01T12:00:00.000Z',
            compromised: false,
        },
        {
            key: 'dvc_server_new',
            createdAt: '2025-01-01T12:00:00.000Z',
            compromised: false,
        },
    ]
    const environment = (
        sdkKeys: Partial<Record<'mobile' | 'client' | 'server', unknown[]>>,
    ) => ({
        key: 'production',
        name: 'Production',
        _id: '61450f3daec96f5cf4a49961',
        sdkKeys: { mobile: [], client: [], server: [], ...sdkKeys },
    })

    const nockEnvironment = (sdkKeys: Record<string, unknown[]>) =>
        dvcTest().nock(BASE_URL, (api) =>
            api
                .get(`/v1/projects/${projectKey}/environments/production`)
                .reply(200, environment(sdkKeys)),
        )

    nockEnvironment({ server: serverKeys })
        .stdout()
        .command([
            'keys get',
            '--project',
            projectKey,
            '--env',
            'production',
            '--type',
            'server',
            '--headless',
            ...authFlags,
        ])
        .it('prints every key, most recent first', (ctx) => {
            expect(ctx.stdout.trim().split('\n')).to.eql([
                'dvc_server_new',
                'dvc_server_old',
            ])
        })

    nockEnvironment({ server: serverKeys })
        .stdout()
        .command([
            'keys get',
            '--project',
            projectKey,
            '--env',
            'production',
            '--type',
            'all',
            '--headless',
            ...authFlags,
        ])
        .it('supports --type all', (ctx) => {
            expect(JSON.parse(ctx.stdout)).to.eql({
                mobile: [],
                client: [],
                server: serverKeys,
            })
        })

    nockEnvironment({
        server: [{ ...serverKeys[0], compromised: true }, serverKeys[1]],
    })
        .stdout()
        .command([
            'keys get',
            '--project',
            projectKey,
            '--env',
            'production',
            '--type',
            'server',
            '--headless',
            ...authFlags,
        ])
        .it('marks compromised keys', (ctx) => {
            expect(ctx.stdout.trim().split('\n')).to.eql([
                'dvc_server_new',
                'dvc_server_old (compromised)',
            ])
        })

    nockEnvironment({
        server: [
            { key: '', createdAt: serverKeys[0].createdAt, compromised: false },
        ],
    })
        .stderr()
        .command([
            'keys get',
            '--project',
            projectKey,
            '--env',
            'production',
            '--type',
            'server',
            '--headless',
            ...authFlags,
        ])
        .catch((err) =>
            expect(err.message).to.contain(
                'do not have permission to view server SDK keys',
            ),
        )
        .it('errors when the key is hidden by permissions')

    nockEnvironment({ server: [] })
        .stderr()
        .command([
            'keys get',
            '--project',
            projectKey,
            '--env',
            'production',
            '--type',
            'server',
            '--headless',
            ...authFlags,
        ])
        .catch((err) =>
            expect(err.message).to.contain('No server SDK keys found'),
        )
        .it('errors when there are no keys of that type')

    dvcTest()
        .stderr()
        .command([
            'keys get',
            '--project',
            projectKey,
            '--env',
            'production',
            '--headless',
            ...authFlags,
        ])
        .catch((err) =>
            expect(err.message).to.contain(
                'In headless mode, the env and type flags are required',
            ),
        )
        .it('requires the type flag in headless mode')
})
