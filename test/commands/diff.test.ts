import { expect, test } from '@oclif/test'
import { AUTH_URL } from '../../src/api/common'

const expected = `
DevCycle Variable Changes:

✅ 5 Variables Added
❌ 1 Variable Removed

✅ Added

	1. simple-case
	   Locations:
	    - test/utils/diff/sampleDiff.js:L1
	    - test/utils/diff/sampleDiff.js:L2
	2. single-quotes
	   Location: test/utils/diff/sampleDiff.js:L4
	3. multi-line
	   Location: test/utils/diff/sampleDiff.js:L10
	4. single-comment
	   Location: test/utils/diff/sampleDiff.js:L16
	5. multi-line-comment
	   Location: test/utils/diff/sampleDiff.js:L19

❌ Removed

	1. simple-case
	   Location: test/utils/diff/sampleDiff.js:L1
`

const customExpected = `
DevCycle Variable Changes:

✅ 6 Variables Added
❌ 1 Variable Removed

✅ Added

	1. simple-case
	   Locations:
	    - test/utils/diff/sampleDiff.js:L1
	    - test/utils/diff/sampleDiff.js:L2
	2. single-quotes
	   Location: test/utils/diff/sampleDiff.js:L4
	3. multi-line
	   Location: test/utils/diff/sampleDiff.js:L10
	4. single-comment
	   Location: test/utils/diff/sampleDiff.js:L16
	5. multi-line-comment
	   Location: test/utils/diff/sampleDiff.js:L19
	6. func-proxy
	   Location: test/utils/diff/sampleDiff.js:L6

❌ Removed

	1. simple-case
	   Location: test/utils/diff/sampleDiff.js:L1
`

describe('diff', () => {
    test
        .stdout()
        .command(['diff', '--file', './test/utils/diff/samples/nodeSampleDiff', '--no-api'])
        .it('runs against a test file', (ctx) => {
            expect(ctx.stdout).to.equal(expected)
        })

    test
        .stdout()
        .command(['diff', '--file',
            './test/utils/diff/samples/nodeSampleDiff',
            '--match-pattern', 'js=checkVariable\\(\\w*,\\s*"([^"\']*)"', '--no-api'])
        .it('runs against a test file with a custom matcher', (ctx) => {
            expect(ctx.stdout).to.equal(customExpected)
        })

    test
        .stdout()
        .command(['diff', '--file',
            './test/utils/diff/samples/nodeSampleDiff',
            '--config-path', './test/commands/fixtures/testConfig.yml', '--no-api'])
        .it('runs against a test file with a custom matcher specified in a config file',
            (ctx) => {
                expect(ctx.stdout).to.equal(customExpected)
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
        .stdout()
        .command(['diff', '--file',
            './test/utils/diff/samples/nodeSampleDiff',
            '--client-id', 'client', '--client-secret', 'secret', '--project', 'project'])
        .it('runs with successful api authorization',
            (ctx) => {
                expect(ctx.stdout).to.equal(expected)
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
            './test/utils/diff/samples/nodeSampleDiff',
            '--client-id', 'client', '--client-secret', 'secret', '--project', 'project'])
        .catch('Failed to authenticate with the DevCycle API. Check your credentials.')
        .it('runs with failed api authorization')
})
