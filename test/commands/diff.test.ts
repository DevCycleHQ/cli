import { expect, test } from '@oclif/test'

const expected = `
DevCycle Variable Changes:

✅ 4 Variables Added
❌ 1 Variable Removed

✅ Added

	1. simple-case
	   Locations:
	    - test/utils/diff/sampleDiff.js:L1
	    - test/utils/diff/sampleDiff.js:L2
	2. single-quotes
	   Location: test/utils/diff/sampleDiff.js:L4
	3. single-comment
	   Location: test/utils/diff/sampleDiff.js:L16
	4. multi-line-comment
	   Location: test/utils/diff/sampleDiff.js:L19

❌ Removed

	1. simple-case
	   Location: test/utils/diff/sampleDiff.js:L1
`

describe('diff', () => {
    test
        .stdout()
        .command(['diff', '--file', './test/utils/diff/samples/nodeSampleDiff'])
        .it('runs against a test file', (ctx) => {
            expect(ctx.stdout).to.equal(expected)
        })
})
