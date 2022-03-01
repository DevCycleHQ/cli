import { expect, test } from '@oclif/test'

const expected = `
DevCycle Variable Usage:

1. simple-case
\t- test/utils/usages/samples/nodejs.js:L1
\t- test/utils/usages/samples/nodejs.js:L2
2. single-quotes
\t- test/utils/usages/samples/nodejs.js:L4
3. multi-line
\t- test/utils/usages/samples/nodejs.js:L10
4. single-comment
\t- test/utils/usages/samples/nodejs.js:L17
5. multi-line-comment
\t- test/utils/usages/samples/nodejs.js:L20
6. user-object
\t- test/utils/usages/samples/nodejs.js:L23
7. user-constructor
\t- test/utils/usages/samples/nodejs.js:L24
8. multi-line-user-object
\t- test/utils/usages/samples/nodejs.js:L25
9. VARIABLES.ENUM_VARIABLE
\t- test/utils/usages/samples/nodejs.js:L33
`

describe('usages', () => {
    test
        .stdout()
        .command(['usages', '--include', 'test/utils/usages/samples/nodejs.js'])
        .it('runs against a test file', (ctx) => {
            expect(ctx.stdout).to.equal(expected)
        })
})
