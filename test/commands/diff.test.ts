/* eslint-disable max-len */
import { expect, test } from '@oclif/test'
import { AUTH_URL, BASE_URL } from '../../src/api/common'

process.env = {}

const expected = `
DevCycle Variable Changes:

✅  4 Variables Added
❌  1 Variable Removed

✅ Added

  1. simple-case
	   Locations:
	    - test/utils/diff/sampleDiff.js:L1
	    - test/utils/diff/sampleDiff.js:L2
  2. single-quotes
	   Location: test/utils/diff/sampleDiff.js:L4
  3. multi-line
	   Location: test/utils/diff/sampleDiff.js:L10
  4. multi-line-comment
	   Location: test/utils/diff/sampleDiff.js:L20

❌ Removed

  1. simple-case
	   Location: test/utils/diff/sampleDiff.js:L1
`

const customExpected = `
DevCycle Variable Changes:

✅  5 Variables Added
❌  1 Variable Removed

✅ Added

  1. simple-case
	   Locations:
	    - test/utils/diff/sampleDiff.js:L1
	    - test/utils/diff/sampleDiff.js:L2
  2. single-quotes
	   Location: test/utils/diff/sampleDiff.js:L4
  3. multi-line
	   Location: test/utils/diff/sampleDiff.js:L10
  4. multi-line-comment
	   Location: test/utils/diff/sampleDiff.js:L20
  5. func-proxy
	   Location: test/utils/diff/sampleDiff.js:L6

❌ Removed

  1. simple-case
	   Location: test/utils/diff/sampleDiff.js:L1
`

const linkedExpected = `
DevCycle Variable Changes:

✅  4 Variables Added
❌  1 Variable Removed

✅ Added

  1. simple-case
	   Locations:
	    - [test/utils/diff/sampleDiff.js:L1](https://example.com/files#diff-c197a837fe3ee51fcef381dc90df1cde5c759ad43f47c0cb72968af943205fa3R1)
	    - [test/utils/diff/sampleDiff.js:L2](https://example.com/files#diff-c197a837fe3ee51fcef381dc90df1cde5c759ad43f47c0cb72968af943205fa3R2)
  2. single-quotes
	   Location: [test/utils/diff/sampleDiff.js:L4](https://example.com/files#diff-c197a837fe3ee51fcef381dc90df1cde5c759ad43f47c0cb72968af943205fa3R4)
  3. multi-line
	   Location: [test/utils/diff/sampleDiff.js:L10](https://example.com/files#diff-c197a837fe3ee51fcef381dc90df1cde5c759ad43f47c0cb72968af943205fa3R10)
  4. multi-line-comment
	   Location: [test/utils/diff/sampleDiff.js:L20](https://example.com/files#diff-c197a837fe3ee51fcef381dc90df1cde5c759ad43f47c0cb72968af943205fa3R20)

❌ Removed

  1. simple-case
	   Location: [test/utils/diff/sampleDiff.js:L1](https://example.com/files#diff-c197a837fe3ee51fcef381dc90df1cde5c759ad43f47c0cb72968af943205fa3L1)
`

const apiExpected = `
DevCycle Variable Changes:

⚠️   1 Variable With Notices
✅  2 Variables Added
❌  2 Variables Removed
🧹  1 Variable Cleaned up

⚠️  Notices

  1. Variable "no-exists" does not exist on DevCycle

✅ Added

  1. exists
	   Type: String
	   Location: test/utils/diff/sampleDiff.js:L1
  2. no-exists ⚠️
	   Location: test/utils/diff/sampleDiff.js:L2

❌ Removed

  1. exists2
	   Type: String
	   Location: test/utils/diff/sampleDiff.js:L1
  2. no-exists2 🧹
	   Location: test/utils/diff/sampleDiff.js:L2

🧹 Cleaned Up

The following variables that do not exist in DevCycle were cleaned up:

  1. no-exists2
`

describe('diff', () => {
    test
        .stdout()
        .command(['diff', '--file', './test/utils/diff/samples/nodejs', '--no-api'])
        .it('runs against a test file', (ctx) => {
            expect(ctx.stdout).to.equal(expected)
        })

    test
        .stdout()
        .command(['diff', '--file',
            './test/utils/diff/samples/nodejs',
            '--match-pattern', 'js=checkVariable\\(\\w*,\\s*"([^"\']*)"', '--no-api'])
        .it('runs against a test file with a custom matcher', (ctx) => {
            expect(ctx.stdout).to.equal(customExpected)
        })

    test
        .stdout()
        .command(['diff', '--file',
            './test/utils/diff/samples/nodejs',
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
            }).reply(403, {
                message: 'Failed auth'
            })
        })
        .command(['diff', '--file',
            './test/utils/diff/samples/nodejs',
            '--client-id', 'client', '--client-secret', 'secret', '--project', 'project'])
        .catch('Failed to authenticate with the DevCycle API. Check your credentials.')
        .it('runs with failed api authorization')

    test
        .stdout()
        .command(['diff', '--file', './test/utils/diff/samples/nodejs', '--no-api', '--pr-link', 'https://example.com'])
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
})
