/* eslint-disable max-len */
import { expect, test } from '@oclif/test'
import chai from 'chai'
import { jestSnapshotPlugin } from 'mocha-chai-jest-snapshot'
import { setCurrentTestFile } from '../../../test-utils'
import { AUTH_URL, BASE_URL } from '../../api/common'

process.env = {}

describe('diff', () => {
    beforeEach(setCurrentTestFile(__filename))
    chai.use(jestSnapshotPlugin())

    test
        .stdout()
        .command(['diff', '--file', './test-utils/fixtures/diff/e2e', '--no-api'])
        .it('runs against a test file', (ctx) => {
            expect(ctx.stdout).toMatchSnapshot()
        })

    test
        .stdout()
        .command(['diff', '--file',
            './test-utils/fixtures/diff/e2e',
            '--match-pattern', 'js=checkVariable\\(\\w*,\\s*([^,)]*)', '--no-api'])
        .it('runs against a test file with a custom matcher', (ctx) => {
            expect(ctx.stdout).toMatchSnapshot()
        })

    test
        .stdout()
        .command(['diff', '--file',
            './test-utils/fixtures/diff/e2e',
            '--repo-config-path', './test-utils/fixtures/configs/customMatcherConfig.yml', '--no-api'])
        .it('runs against a test file with a custom matcher specified in a config file',
            (ctx) => {
                expect(ctx.stdout).toMatchSnapshot()
            })

    test
        .stdout()
        .command(['diff', '--file',
            'test-utils/fixtures/diff/custom-pattern',
            '--match-pattern', 'jsx=useDVCVariable\\(\\s*([^,)]*)\\s*,\\s*(?:[^),]*|{[^}]*})\\)',
            '--var-alias', 'ALIASED_VARIABLE=my-variable',
            '--no-api'])
        .it('identifies an aliased variable with a custom matcher', (ctx) => {
            expect(ctx.stdout).toMatchSnapshot()
        })

    test
        .stdout()
        .command(['diff', '--file',
            'test-utils/fixtures/diff/custom-pattern-value',
            '--match-pattern', 'jsx=useDVCVariableValue\\(\\s*([^,)]*)\\s*,\\s*(?:[^),]*|{[^}]*})\\)',
            '--var-alias', 'ALIASED_VARIABLE_VALUE=my-variable',
            '--no-api'])
        .it('identifies an aliased variable value with a custom matcher', (ctx) => {
            expect(ctx.stdout).toMatchSnapshot()
        })

    test
        .nock(AUTH_URL, (api) => {
            api.post('/oauth/token', {
                grant_type: 'client_credentials',
                client_id: 'client',
                client_secret: 'secret',
                audience: 'https://api.devcycle.com/',
            }).reply(403, {
                message: 'Failed auth'
            })
        })
        .stdout()
        .command(['diff', '--file',
            './test-utils/fixtures/diff/e2e',
            '--client-id', 'client', '--client-secret', 'secret', '--project', 'project'])
        .it('runs with failed api authorization', (ctx) => {
            expect(ctx.stdout).to.contain('Failed to authenticate with the DevCycle API. Check your credentials.')
        })

    test
        .stdout()
        .command(['diff', '--file', './test-utils/fixtures/diff/e2e', '--no-api', '--pr-link', 'https://example.com'])
        .it('runs against a test file and linkifies the output', (ctx) => {
            expect(ctx.stdout).toMatchSnapshot()
        })

    test
        .stdout()
        .command([
            'diff', '--file', './test-utils/fixtures/diff/e2e', '--no-api',
            '--pr-link', 'https://bitbucket.org/devcyclehq/test-code-refs-pipes/pull-requests/7'
        ])
        .it('runs against a test file and linkifies the output for a bitbucket PR', (ctx) => {
            expect(ctx.stdout).toMatchSnapshot()
        })

    test
        .nock(AUTH_URL, (api) => {
            api.post('/oauth/token', {
                grant_type: 'client_credentials',
                client_id: 'client',
                client_secret: 'secret',
                audience: 'https://api.devcycle.com/',
            }).reply(200, {
                access_token: 'token'
            })
        })
        .nock(BASE_URL, { reqheaders: { authorization: 'token' } }, (api) => {
            api.get(/v1\/projects\/project\/variables\/.*/)
                .times(4)
                .reply(200, (uri) => {
                    const parts = uri.split('/')
                    const key = parts[parts.length - 1]
                    if (key.includes('no-exists')) {
                        return null
                    }

                    return {
                        key,
                        type: 'String'
                    }
                })
        })
        .stdout()
        .command(['diff', '--file', 'test-utils/fixtures/diff/apiEnrichment/enrichment',
            '--client-id', 'client', '--client-secret', 'secret', '--project', 'project'])
        .it('enriches output with API data', (ctx) => {
            expect(ctx.stdout).toMatchSnapshot()
        })

    test
        .stdout()
        .command(['diff', '--file',
            'test-utils/fixtures/diff/aliases/aliased', '--no-api'])
        .it('identifies unknown variables and warns about them',
            (ctx) => {
                expect(ctx.stdout).toMatchSnapshot()
            })

    test
        .stdout()
        .command(['diff', '--file',
            'test-utils/fixtures/diff/aliases/aliased', '--no-api',
            '--var-alias', 'SOME_ADDITION=some-addition', 'VARIABLES.SOME_REMOVAL=some-removal'
        ])
        .it('identifies aliased variables',
            (ctx) => {
                expect(ctx.stdout).toMatchSnapshot()
            })

    test
        .stdout()
        .command(['diff', '--file',
            'test-utils/fixtures/diff/aliases/aliased', '--no-api',
            '--repo-config-path', './test-utils/fixtures/configs/variableAliasConfig.yml'
        ])
        .it('identifies aliased variables specified in config file',
            (ctx) => {
                expect(ctx.stdout).toMatchSnapshot()
            })
    test
        .stdout()
        .command(['diff', '--file',
            'test-utils/fixtures/diff/optional-accessor', '--no-api', '--format', 'markdown'
        ])
        .it('formats the output as markdown',
            (ctx) => {
                expect(ctx.stdout).toMatchSnapshot()
            })

    test
        .stdout()
        .command(['diff', '--file',
            'test-utils/fixtures/diff/optional-accessor', '--no-api', '--format', 'markdown-no-html'
        ])
        .it('formats the output as markdown without html',
            (ctx) => {
                expect(ctx.stdout).toMatchSnapshot()
            })

    test
        .stdout()
        .command(['diff', '--file',
            'test-utils/fixtures/diff/optional-accessor', '--no-api', '--show-regex'
        ])
        .it('outputs the regex patterns used for matching',
            (ctx) => {
                expect(ctx.stdout).to.contain('Pattern for nodejs parser')
                expect(ctx.stdout).to.contain('Pattern for react parser')
                expect(ctx.stdout).to.contain('Pattern for javascript parser')

            })
})
