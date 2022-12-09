import { expect, test } from '@oclif/test'
import DVCFiles from '../../utils/files/dvcFiles'
import MockDVCFiles from '../../utils/files/mockDvcFiles'

const nodeExpected = `
DevCycle Variable Usage:

1. simple-case
\t- test/utils/usages/samples/nodejs.js:L1
\t- test/utils/usages/samples/nodejs.js:L2
2. single-quotes
\t- test/utils/usages/samples/nodejs.js:L4
3. multi-line
\t- test/utils/usages/samples/nodejs.js:L10
4. multi-line-comment
\t- test/utils/usages/samples/nodejs.js:L20
5. user-object
\t- test/utils/usages/samples/nodejs.js:L23
6. user-constructor
\t- test/utils/usages/samples/nodejs.js:L24
7. multi-line-user-object
\t- test/utils/usages/samples/nodejs.js:L25
8. multiline-extra-comma
\t- test/utils/usages/samples/nodejs.js:L36
`

const reactExpected = `
DevCycle Variable Usage:

1. simple-case
\t- test/utils/usages/samples/react.js:L1
\t- test/utils/usages/samples/react.js:L6
\t- test/utils/usages/samples/react.js:L11
`

const goExpected = `
DevCycle Variable Usage:

1. hello-test
\t- test/utils/usages/samples/golang.go:L1
`

describe('usages', () => {
    test
        .do(() => DVCFiles.setInstance(new MockDVCFiles()))
        .stdout()
        .command(['usages', '--include', 'test/utils/usages/samples/nodejs.js'])
        .it('runs against a node test file', (ctx) => {
            expect(ctx.stdout).to.equal(nodeExpected)
        })

    test
        .do(() => DVCFiles.setInstance(new MockDVCFiles()))
        .stdout()
        .command(['usages', '--include', 'test/utils/usages/samples/react.js'])
        .it('runs against a react test file', (ctx) => {
            expect(ctx.stdout).to.equal(reactExpected)
        })

    test
        .do(() => DVCFiles.setInstance(new MockDVCFiles()))
        .stdout()
        .command(['usages', '--include', 'test/utils/usages/samples/golang.go'])
        .it('runs against a go test file', (ctx) => {
            expect(ctx.stdout).to.equal(goExpected)
        })
})
