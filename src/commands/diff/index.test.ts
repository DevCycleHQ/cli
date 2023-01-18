/* eslint-disable max-len */
import 'reflect-metadata'
import { expect, test } from '@oclif/test'
import { AUTH_URL, BASE_URL } from '../../api/common'
import DVCFiles from '../../utils/files/dvcFiles'
import MockDVCFiles from '../../utils/files/mockDvcFiles'
import Roots from '../../utils/files/roots'
import path from 'path'

const makeSamplePath = (sample: string) =>
    path.join(__dirname, '../../../test/samples/diff/', sample)

process.env = {}

const expected = `
DevCycle Variable Changes:

🟢  6 Variables Added
🔴  1 Variable Removed

🟢 Added

  1. simple-case
	   Location: test/samples/diff/sampleDiff.js:L1
  2. duplicate-case
	   Locations:
	    - test/samples/diff/sampleDiff.js:L2
	    - test/samples/diff/sampleDiff.js:L3
  3. single-quotes
	   Location: test/samples/diff/sampleDiff.js:L5
  4. multi-line
	   Location: test/samples/diff/sampleDiff.js:L11
  5. multi-line-comment
	   Location: test/samples/diff/sampleDiff.js:L21
  6. duplicate-same-line
\t   Location: test/samples/diff/sampleDiff.js:L26

🔴 Removed

  1. simple-case
	   Location: test/samples/diff/sampleDiff.js:L1
`

const customConfig = `
codeInsights:
    matchPatterns:
        js:
        - checkVariable\\(\\w*,\\s*([^,)]*)
`

const customExpected = `
DevCycle Variable Changes:

🟢  7 Variables Added
🔴  1 Variable Removed

🟢 Added

  1. simple-case
	   Location: test/samples/diff/sampleDiff.js:L1
  2. duplicate-case
	   Locations:
	    - test/samples/diff/sampleDiff.js:L2
	    - test/samples/diff/sampleDiff.js:L3
  3. single-quotes
	   Location: test/samples/diff/sampleDiff.js:L5
  4. multi-line
	   Location: test/samples/diff/sampleDiff.js:L11
  5. multi-line-comment
	   Location: test/samples/diff/sampleDiff.js:L21
  6. duplicate-same-line
\t   Location: test/samples/diff/sampleDiff.js:L26
  7. func-proxy
\t   Location: test/samples/diff/sampleDiff.js:L7

🔴 Removed

  1. simple-case
	   Location: test/samples/diff/sampleDiff.js:L1
`

const aliasedCustomExpected = `
DevCycle Variable Changes:

🟢  1 Variable Added
🔴  0 Variables Removed

🟢 Added

  1. my-variable
	   Location: test/samples/diff/sampleDiff.jsx:L1
`

const linkedExpected = `
DevCycle Variable Changes:

🟢  6 Variables Added
🔴  1 Variable Removed

🟢 Added

  1. simple-case
	   Location: [test/samples/diff/sampleDiff.js:L1](https://example.com/files#diff-4cd981ea81ae1f6ecfdbf989d0fdd66473aae7029b3ea7b6f1d61c6bcb9e429dR1)
  2. duplicate-case
	   Locations:
	    - [test/samples/diff/sampleDiff.js:L2](https://example.com/files#diff-4cd981ea81ae1f6ecfdbf989d0fdd66473aae7029b3ea7b6f1d61c6bcb9e429dR2)
	    - [test/samples/diff/sampleDiff.js:L3](https://example.com/files#diff-4cd981ea81ae1f6ecfdbf989d0fdd66473aae7029b3ea7b6f1d61c6bcb9e429dR3)
  3. single-quotes
	   Location: [test/samples/diff/sampleDiff.js:L5](https://example.com/files#diff-4cd981ea81ae1f6ecfdbf989d0fdd66473aae7029b3ea7b6f1d61c6bcb9e429dR5)
  4. multi-line
	   Location: [test/samples/diff/sampleDiff.js:L11](https://example.com/files#diff-4cd981ea81ae1f6ecfdbf989d0fdd66473aae7029b3ea7b6f1d61c6bcb9e429dR11)
  5. multi-line-comment
	   Location: [test/samples/diff/sampleDiff.js:L21](https://example.com/files#diff-4cd981ea81ae1f6ecfdbf989d0fdd66473aae7029b3ea7b6f1d61c6bcb9e429dR21)
  6. duplicate-same-line
\t   Location: [test/samples/diff/sampleDiff.js:L26](https://example.com/files#diff-4cd981ea81ae1f6ecfdbf989d0fdd66473aae7029b3ea7b6f1d61c6bcb9e429dR26)

🔴 Removed

  1. simple-case
	   Location: [test/samples/diff/sampleDiff.js:L1](https://example.com/files#diff-4cd981ea81ae1f6ecfdbf989d0fdd66473aae7029b3ea7b6f1d61c6bcb9e429dL1)
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
	   Location: test/samples/diff/sampleDiff.js:L1
  2. no-exists ⚠️
	   Location: test/samples/diff/sampleDiff.js:L2

🔴 Removed

  1. exists2
	   Type: String
	   Location: test/samples/diff/sampleDiff.js:L1
  2. no-exists2 🧹
	   Location: test/samples/diff/sampleDiff.js:L2

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
	   Location: test/samples/diff/sampleDiff.js:L1

🔴 Removed

  1. VARIABLES.SOME_REMOVAL ⚠️
	   Location: test/samples/diff/sampleDiff.js:L1
`

const aliasConfig = `
codeInsights:
    variableAliases:
        SOME_ADDITION: some-addition
        VARIABLES.SOME_REMOVAL: some-removal              
`
const aliasExpected = `
DevCycle Variable Changes:

🟢  1 Variable Added
🔴  1 Variable Removed

🟢 Added

  1. some-addition
	   Location: test/samples/diff/sampleDiff.js:L1

🔴 Removed

  1. some-removal
	   Location: test/samples/diff/sampleDiff.js:L1
`

const formattedMarkdownExpected = `
## <img src="https://github.com/DevCycleHQ/cli/raw/main/assets/togglebot.svg#gh-light-mode-only" height="31px" align="center"/><img src="https://github.com/DevCycleHQ/cli/raw/main/assets/togglebot-white.svg#gh-dark-mode-only" height="31px" align="center"/> DevCycle Variable Changes:

🟢  1 Variable Added
🔴  0 Variables Removed

### 🟢 Added

  1. **optional-accessor**
\t   Location: services/api/src/organizations/organizations.controller.ts:L177
`

const formattedMarkdownNoHtmlExpected = `
## DevCycle Variable Changes:

🟢  1 Variable Added
🔴  0 Variables Removed

### 🟢 Added

  1. **optional-accessor**
\t   Location: services/api/src/organizations/organizations.controller.ts:L177
`
describe('diff command', () => {
    test
        .do(() => DVCFiles.setInstance(new MockDVCFiles()))
        .stdout()
        .command(['diff', '--file', `${makeSamplePath('e2e')}`, '--no-api'])
        .it('runs against a test file', (ctx) => {
            expect(ctx.stdout).to.equal(expected)
        })

    test
        .do(() => DVCFiles.setInstance(new MockDVCFiles()))
        .stdout()
        .command(['diff', '--file',
            `${makeSamplePath('e2e')}`,
            '--match-pattern', 'js=checkVariable\\(\\w*,\\s*([^,)]*)', '--no-api'])
        .it('uses a custom matcher from a flag', (ctx) => {
            expect(ctx.stdout).to.equal(customExpected)
        })

    test
        .do(() => DVCFiles.setInstance(new MockDVCFiles({
            [Roots.repo]: {
                'customMatcherConfig.yml': customConfig
            }
        })))
        .stdout()
        .command(['diff', '--file',
            `${makeSamplePath('e2e')}`,
            '--repo-config-path', './repo/customMatcherConfig.yml', '--no-api'])
        .it('uses a custom matcher from a config file',
            (ctx) => {
                expect(ctx.stdout).to.equal(customExpected)
            }
        )

    test
        .do(() => DVCFiles.setInstance(new MockDVCFiles()))
        .stdout()
        .command(['diff', '--file',
            `${makeSamplePath('custom-pattern')}`,
            '--match-pattern', 'jsx=useDVCVariable\\(\\s*([^,)]*)\\s*,\\s*(?:[^),]*|{[^}]*})\\)',
            '--var-alias', 'ALIASED_VARIABLE=my-variable',
            '--no-api'])
        .it('identifies an aliased variable with a custom matcher', (ctx) => {
            expect(ctx.stdout).to.equal(aliasedCustomExpected)
        })

    test
        .do(() => DVCFiles.setInstance(new MockDVCFiles()))
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
            `${makeSamplePath('e2e')}`,
            '--client-id', 'client', '--client-secret', 'secret', '--project', 'project'])
        .catch('Failed to authenticate with the DevCycle API. Check your credentials.')
        .it('runs with failed api authorization')

    test
        .do(() => DVCFiles.setInstance(new MockDVCFiles()))
        .stdout()
        .command(['diff', '--file', `${makeSamplePath('e2e')}`, '--no-api', '--pr-link', 'https://example.com'])
        .it('runs against a test file and linkifies the output', (ctx) => {
            expect(ctx.stdout).to.equal(linkedExpected)
        })

    test
        .do(() => DVCFiles.setInstance(new MockDVCFiles()))
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
        .command(['diff', '--file', `${makeSamplePath('apiEnrichment/enrichment')}`,
            '--client-id', 'client', '--client-secret', 'secret', '--project', 'project'])
        .it('enriches output with API data', (ctx) => {
            expect(ctx.stdout).to.equal(apiExpected)
        })

    test
        .do(() => DVCFiles.setInstance(new MockDVCFiles()))
        .stdout()
        .command(['diff', '--file',
            `${makeSamplePath('aliases/aliased')}`, '--no-api'])
        .it('identifies unknown variables and warns about them',
            (ctx) => {
                expect(ctx.stdout).to.equal(unknownExpected)
            })

    test
        .do(() => DVCFiles.setInstance(new MockDVCFiles()))
        .stdout()
        .command(['diff', '--file',
            `${makeSamplePath('aliases/aliased')}`, '--no-api',
            '--var-alias', 'SOME_ADDITION=some-addition', 'VARIABLES.SOME_REMOVAL=some-removal'
        ])
        .it('identifies aliased variables',
            (ctx) => {
                expect(ctx.stdout).to.equal(aliasExpected)
            })

    test
        .do(() => DVCFiles.setInstance(new MockDVCFiles({
            [Roots.repo]: {
                'variableAliasConfig.yml': aliasConfig
            }
        })))
        .stdout()
        .command(['diff', '--file',
            `${makeSamplePath('aliases/aliased')}`, '--no-api',
            '--repo-config-path', './repo/variableAliasConfig.yml'
        ])
        .it('identifies aliased variables specified in config file',
            (ctx) => {
                expect(ctx.stdout).to.equal(aliasExpected)
            })
    test
        .do(() => DVCFiles.setInstance(new MockDVCFiles()))
        .stdout()
        .command(['diff', '--file',
            `${makeSamplePath('optional-accessor')}`, '--no-api', '--format', 'markdown'
        ])
        .it('formats the output as markdown',
            (ctx) => {
                expect(ctx.stdout).to.equal(formattedMarkdownExpected)
            })

    test
        .do(() => DVCFiles.setInstance(new MockDVCFiles()))
        .stdout()
        .command(['diff', '--file',
            `${makeSamplePath('optional-accessor')}`, '--no-api', '--format', 'markdown-no-html',
        ])
        .it('formats the output as markdown without html',
            (ctx) => {
                expect(ctx.stdout).to.equal(formattedMarkdownNoHtmlExpected)
            })

    test
        .do(() => DVCFiles.setInstance(new MockDVCFiles()))
        .stdout()
        .command(['diff', '--file',
            `${makeSamplePath('optional-accessor')}`, '--no-api', '--show-regex'
        ])
        .it('outputs the regex patterns used for matching',
            (ctx) => {
                expect(ctx.stdout).to.contain('Pattern for nodejs parser')
                expect(ctx.stdout).to.contain('Pattern for react parser')
                expect(ctx.stdout).to.contain('Pattern for javascript parser')

            })
})
