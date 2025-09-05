import { expect, vi } from 'vitest'
import inquirer from 'inquirer'
import { dvcTest } from '../../../test-utils'
import { AUTH_URL, BASE_URL } from '../../api/common'
import axios from 'axios'
import { tokenCacheStub_get } from '../../../test/setup'

describe('variations list', () => {
    const projectKey = 'test-project'
    const featureKey = 'test-feature'
    const authFlags = [
        '--client-id',
        'test-client-id',
        '--client-secret',
        'test-client-secret',
    ]

    const mockVariations = [
        {
            key: 'variation-1',
            name: 'Variation 1',
            variables: {
                'show-new-dashboard': true,
                'string-var': 'hello world',
                'bool-var': true,
                'num-var': 99,
                'json-var': {},
            },
            _id: '61450f3daec96f5cf4a49946',
        },
        {
            key: 'variation-2',
            name: 'Variation 2',
            variables: {},
            _id: '61450f3daec96f5cf4a49947',
        },
    ]

    dvcTest()
        .do(async () => {
            tokenCacheStub_get.returns('mock-cached-token')
            await axios.post(new URL('/oauth/token', AUTH_URL).href)
        })
        .nock(BASE_URL, (api) =>
            api
                .get(
                    `/v1/projects/${projectKey}/features/${featureKey}/variations`,
                )
                .reply(200, mockVariations),
        )
        .stdout()
        .command([
            'variations list',
            featureKey,
            '--project',
            projectKey,
            ...authFlags,
        ])
        .it('returns a list of variation keys', (ctx) => {
            expect(ctx.stdout).to.contain(
                JSON.stringify(['variation-1', 'variation-2'], null, 2),
            )
        })

    dvcTest()
        .do(async () => {
            tokenCacheStub_get.returns('mock-cached-token')
            await axios.post(new URL('/oauth/token', AUTH_URL).href)
        })
        .nock(BASE_URL, (api) =>
            api
                .get(
                    `/v1/projects/${projectKey}/features/prompted-feature-id/variations`,
                )
                .reply(200, mockVariations),
        )
        .stub(inquirer, 'prompt', () => {
            return { feature: { key: 'prompted-feature-id' } }
        })
        .stdout()
        .command(['variations list', '--project', projectKey, ...authFlags])
        .it('prompts for feature when not provided', (ctx) => {
            expect(ctx.stdout).to.contain(
                JSON.stringify(['variation-1', 'variation-2'], null, 2),
            )
        })

    let stderrSpy: ReturnType<typeof vi.spyOn> | undefined
    let consoleErrorSpy: ReturnType<typeof vi.spyOn> | undefined
    dvcTest()
        .do(async () => {
            tokenCacheStub_get.returns('mock-cached-token')
            await axios.post(new URL('/oauth/token', AUTH_URL).href)
            stderrSpy = vi.spyOn(process.stderr, 'write' as any)
            consoleErrorSpy = vi.spyOn(console, 'error')
        })
        .stdout()
        .stderr()
        .command([
            'variations list',
            '--headless',
            '--project',
            projectKey,
            ...authFlags,
        ])
        .it('does not prompt when using --headless', () => {
            const stderrCalls = (stderrSpy?.mock.calls || []).flat().join('')
            const consoleErrCalls = (consoleErrorSpy?.mock.calls || [])
                .flat()
                .join('')
            const combined = `${stderrCalls}${consoleErrCalls}`
            expect(combined).toContain('In headless mode, feature is required')
            stderrSpy?.mockRestore()
            consoleErrorSpy?.mockRestore()
        })
})
