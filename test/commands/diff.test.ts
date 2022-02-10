/* eslint-disable max-len */
import { expect, test } from '@oclif/test'
import { AUTH_URL, BASE_URL } from '../../src/api/common'

process.env = {}

const expected = `
DevCycle Variable Changes:

🟢  6 Variables Added
🔴  1 Variable Removed

🟢 Added

  1. simple-case
	   Location: test/utils/diff/sampleDiff.js:L1
  2. duplicate-case
	   Locations:
	    - test/utils/diff/sampleDiff.js:L2
	    - test/utils/diff/sampleDiff.js:L3
  3. single-quotes
	   Location: test/utils/diff/sampleDiff.js:L5
  4. multi-line
	   Location: test/utils/diff/sampleDiff.js:L11
  5. multi-line-comment
	   Location: test/utils/diff/sampleDiff.js:L21
  6. duplicate-same-line
\t   Location: test/utils/diff/sampleDiff.js:L26

🔴 Removed

  1. simple-case
	   Location: test/utils/diff/sampleDiff.js:L1
`

const customExpected = `
DevCycle Variable Changes:

🟢  7 Variables Added
🔴  1 Variable Removed

🟢 Added

  1. simple-case
	   Location: test/utils/diff/sampleDiff.js:L1
  2. duplicate-case
	   Locations:
	    - test/utils/diff/sampleDiff.js:L2
	    - test/utils/diff/sampleDiff.js:L3
  3. single-quotes
	   Location: test/utils/diff/sampleDiff.js:L5
  4. multi-line
	   Location: test/utils/diff/sampleDiff.js:L11
  5. multi-line-comment
	   Location: test/utils/diff/sampleDiff.js:L21
  6. duplicate-same-line
\t   Location: test/utils/diff/sampleDiff.js:L26
  7. func-proxy
\t   Location: test/utils/diff/sampleDiff.js:L7

🔴 Removed

  1. simple-case
	   Location: test/utils/diff/sampleDiff.js:L1
`

const aliasedCustomExpected = `
DevCycle Variable Changes:

🟢  1 Variable Added
🔴  0 Variables Removed

🟢 Added

  1. my-variable
	   Location: test/utils/diff/sampleDiff.jsx:L1
`

const linkedExpected = `
DevCycle Variable Changes:

🟢  6 Variables Added
🔴  1 Variable Removed

🟢 Added

  1. simple-case
	   Location: [test/utils/diff/sampleDiff.js:L1](https://example.com/files#diff-c197a837fe3ee51fcef381dc90df1cde5c759ad43f47c0cb72968af943205fa3R1)
  2. duplicate-case
	   Locations:
	    - [test/utils/diff/sampleDiff.js:L2](https://example.com/files#diff-c197a837fe3ee51fcef381dc90df1cde5c759ad43f47c0cb72968af943205fa3R2)
	    - [test/utils/diff/sampleDiff.js:L3](https://example.com/files#diff-c197a837fe3ee51fcef381dc90df1cde5c759ad43f47c0cb72968af943205fa3R3)
  3. single-quotes
	   Location: [test/utils/diff/sampleDiff.js:L5](https://example.com/files#diff-c197a837fe3ee51fcef381dc90df1cde5c759ad43f47c0cb72968af943205fa3R5)
  4. multi-line
	   Location: [test/utils/diff/sampleDiff.js:L11](https://example.com/files#diff-c197a837fe3ee51fcef381dc90df1cde5c759ad43f47c0cb72968af943205fa3R11)
  5. multi-line-comment
	   Location: [test/utils/diff/sampleDiff.js:L21](https://example.com/files#diff-c197a837fe3ee51fcef381dc90df1cde5c759ad43f47c0cb72968af943205fa3R21)
  6. duplicate-same-line
\t   Location: [test/utils/diff/sampleDiff.js:L26](https://example.com/files#diff-c197a837fe3ee51fcef381dc90df1cde5c759ad43f47c0cb72968af943205fa3R26)

🔴 Removed

  1. simple-case
	   Location: [test/utils/diff/sampleDiff.js:L1](https://example.com/files#diff-c197a837fe3ee51fcef381dc90df1cde5c759ad43f47c0cb72968af943205fa3L1)
`

const apiExpected = `
DevCycle Variable Changes:

⚠️   1 Variable With Notices
🟢  2 Variables Added
🔴  2 Variables Removed
🧹  1 Variable Cleaned up

⚠️  Notices

  1. Variable "no-exists" does not exist on DevCycle

🟢 Added

  1. exists
	   Type: String
	   Location: test/utils/diff/sampleDiff.js:L1
  2. no-exists ⚠️
	   Location: test/utils/diff/sampleDiff.js:L2

🔴 Removed

  1. exists2
	   Type: String
	   Location: test/utils/diff/sampleDiff.js:L1
  2. no-exists2 🧹
	   Location: test/utils/diff/sampleDiff.js:L2

🧹 Cleaned Up

The following variables that do not exist in DevCycle were cleaned up:

  1. no-exists2
`

const unknownExpected = `
DevCycle Variable Changes:

⚠️   2 Variables With Notices
🟢  1 Variable Added
🔴  1 Variable Removed

⚠️  Notices

  1. Variable "SOME_ADDITION" could not be identified. Try adding an alias.
  2. Variable "VARIABLES.SOME_REMOVAL" could not be identified. Try adding an alias.

🟢 Added

  1. SOME_ADDITION ⚠️
	   Location: test/utils/diff/sampleDiff.js:L1

🔴 Removed

  1. VARIABLES.SOME_REMOVAL ⚠️
	   Location: test/utils/diff/sampleDiff.js:L1
`

const aliasExpected = `
DevCycle Variable Changes:

🟢  1 Variable Added
🔴  1 Variable Removed

🟢 Added

  1. some-addition
	   Location: test/utils/diff/sampleDiff.js:L1

🔴 Removed

  1. some-removal
	   Location: test/utils/diff/sampleDiff.js:L1
`

const formattedExpected = `
## <img src="https://github.com/DevCycleHQ/cli/raw/main/assets/togglebot.svg" height="31px" align="center"/> DevCycle Variable Changes:

🟢  1 Variable Added
🔴  0 Variables Removed

### 🟢 Added

  1. **optional-accessor**
\t   Location: services/api/src/organizations/organizations.controller.ts:L177
`

describe('diff', () => {
    test
        .stdout()
        .command(['diff', '--file', './test/utils/diff/samples/e2e', '--no-api'])
        .it('runs against a test file', (ctx) => {
            expect(ctx.stdout).to.equal(expected)
        })

    test
        .stdout()
        .command(['diff', '--file',
            './test/utils/diff/samples/e2e',
            '--match-pattern', 'js=checkVariable\\(\\w*,\\s*([^,)]*)', '--no-api'])
        .it('runs against a test file with a custom matcher', (ctx) => {
            expect(ctx.stdout).to.equal(customExpected)
        })

    test
        .stdout()
        .command(['diff', '--file',
            './test/utils/diff/samples/e2e',
            '--config-path', './test/commands/fixtures/customMatcherConfig.yml', '--no-api'])
        .it('runs against a test file with a custom matcher specified in a config file',
            (ctx) => {
                expect(ctx.stdout).to.equal(customExpected)
            })

    test
        .stdout()
        .command(['diff', '--file',
            './test/utils/diff/samples/custom-pattern',
            '--match-pattern', 'jsx=useDVCVariable\\(\\s*([^,)]*)\\s*,\\s*(?:[^),]*|{[^}]*})\\)',
            '--var-alias', 'ALIASED_VARIABLE=my-variable',
            '--no-api'])
        .it('identifies an aliased variable with a custom matcher', (ctx) => {
            expect(ctx.stdout).to.equal(aliasedCustomExpected)
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
        .command(['diff', '--file',
            './test/utils/diff/samples/e2e',
            '--client-id', 'client', '--client-secret', 'secret', '--project', 'project'])
        .catch('Failed to authenticate with the DevCycle API. Check your credentials.')
        .it('runs with failed api authorization')

    test
        .stdout()
        .command(['diff', '--file', './test/utils/diff/samples/e2e', '--no-api', '--pr-link', 'https://example.com'])
        .it('runs against a test file and linkifies the output', (ctx) => {
            expect(ctx.stdout).to.equal(linkedExpected)
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
        .nock(BASE_URL, { reqheaders: { authorization: 'token' } },(api) => {
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
        .command(['diff', '--file', './test/utils/diff/samples/apiEnrichment/enrichment',
            '--client-id', 'client', '--client-secret', 'secret', '--project', 'project'])
        .it('enriches output with API data', (ctx) => {
            expect(ctx.stdout).to.equal(apiExpected)
        })

    test
        .stdout()
        .command(['diff', '--file',
            './test/utils/diff/samples/aliases/aliased', '--no-api'])
        .it('identifies unknown variables and warns about them',
            (ctx) => {
                expect(ctx.stdout).to.equal(unknownExpected)
            })

    test
        .stdout()
        .command(['diff', '--file',
            './test/utils/diff/samples/aliases/aliased', '--no-api',
            '--var-alias', 'SOME_ADDITION=some-addition', 'VARIABLES.SOME_REMOVAL=some-removal'
        ])
        .it('identifies aliased variables',
            (ctx) => {
                expect(ctx.stdout).to.equal(aliasExpected)
            })

    test
        .stdout()
        .command(['diff', '--file',
            './test/utils/diff/samples/aliases/aliased', '--no-api',
            '--config-path', './test/commands/fixtures/variableAliasConfig.yml'
        ])
        .it('identifies aliased variables specified in config file',
            (ctx) => {
                expect(ctx.stdout).to.equal(aliasExpected)
            })
    test
        .stdout()
        .command(['diff', '--file',
            './test/utils/diff/samples/optional-accessor', '--no-api', '--format', 'markdown'
        ])
        .it('formats the output as markdown',
            (ctx) => {
                expect(ctx.stdout).to.equal(formattedExpected)
            })
    test
        .stdout()
        .command(['diff', '--file',
            './test/utils/diff/samples/optional-accessor', '--no-api', '--show-regex'
        ])
        .it('outputs the regex patterns used for matching',
            (ctx) => {
                expect(ctx.stdout).to.contain('Pattern for nodejs parser')
                expect(ctx.stdout).to.contain('Pattern for react parser')
                expect(ctx.stdout).to.contain('Pattern for javascript parser')

            })
})
