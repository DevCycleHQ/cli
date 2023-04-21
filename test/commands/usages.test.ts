import { expect, test } from '@oclif/test'

const nodeExpected = `
DevCycle Variable Usage:

1. simple-case
\t- test-utils/fixtures/usages/nodejs.js:L1
\t- test-utils/fixtures/usages/nodejs.js:L2
2. single-quotes
\t- test-utils/fixtures/usages/nodejs.js:L4
3. multi-line
\t- test-utils/fixtures/usages/nodejs.js:L10
4. multi-line-comment
\t- test-utils/fixtures/usages/nodejs.js:L20
5. user-object
\t- test-utils/fixtures/usages/nodejs.js:L23
6. user-constructor
\t- test-utils/fixtures/usages/nodejs.js:L24
7. multi-line-user-object
\t- test-utils/fixtures/usages/nodejs.js:L25
8. multiline-extra-comma
\t- test-utils/fixtures/usages/nodejs.js:L36
`

const reactExpected = `
DevCycle Variable Usage:

1. simple-case
\t- test-utils/fixtures/usages/react.js:L1
\t- test-utils/fixtures/usages/react.js:L6
\t- test-utils/fixtures/usages/react.js:L11
`

const goExpected = `
DevCycle Variable Usage:

1. hello-test
\t- test-utils/fixtures/usages/golang.go:L1
`

const dartExpected = `
DevCycle Variable Usage:

1. string-variable
\t- test-utils/fixtures/usages/sample.dart:L81
2. boolean-variable
\t- test-utils/fixtures/usages/sample.dart:L92
3. integer-variable
\t- test-utils/fixtures/usages/sample.dart:L102
4. decimal-variable
\t- test-utils/fixtures/usages/sample.dart:L112
5. json-array-variable
\t- test-utils/fixtures/usages/sample.dart:L122
6. json-object-variable
\t- test-utils/fixtures/usages/sample.dart:L135
`

describe('usages', () => {
    test
        .stdout()
        .command(['usages', '--include', 'test-utils/fixtures/usages/nodejs.js'])
        .it('runs against a node test file', (ctx) => {
            expect(ctx.stdout).to.equal(nodeExpected)
        })

    test
        .stdout()
        .command(['usages', '--include', 'test-utils/fixtures/usages/react.js'])
        .it('runs against a react test file', (ctx) => {
            expect(ctx.stdout).to.equal(reactExpected)
        })

    test
        .stdout()
        .command(['usages', '--include', 'test-utils/fixtures/usages/golang.go'])
        .it('runs against a go test file', (ctx) => {
            expect(ctx.stdout).to.equal(goExpected)
        })

    test
        .stdout()
        .command(['usages', '--include', 'test-utils/fixtures/usages/sample.dart'])
        .it('runs against a dart test file', (ctx) => {
            expect(ctx.stdout).to.equal(dartExpected)
        })
})
