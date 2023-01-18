import { expect, test } from '@oclif/test'
import path from 'path'
import DVCFiles from '../../utils/files/dvcFiles'
import MockDVCFiles from '../../utils/files/mockDvcFiles'

const makeSamplePath = (sample: string) =>
    path.join(__dirname, '../../test/samples/usages/', sample)

const nodeExpected = `
DevCycle Variable Usage:

1. simple-case
\t- test/samples/usages/nodejs.js:L1
\t- test/samples/usages/nodejs.js:L2
2. single-quotes
\t- test/samples/usages/nodejs.js:L4
3. multi-line
\t- test/samples/usages/nodejs.js:L10
4. multi-line-comment
\t- test/samples/usages/nodejs.js:L20
5. user-object
\t- test/samples/usages/nodejs.js:L23
6. user-constructor
\t- test/samples/usages/nodejs.js:L24
7. multi-line-user-object
\t- test/samples/usages/nodejs.js:L25
8. multiline-extra-comma
\t- test/samples/usages/nodejs.js:L36
`

const reactExpected = `
DevCycle Variable Usage:

1. simple-case
\t- test/samples/usages/react.js:L1
\t- test/samples/usages/react.js:L6
\t- test/samples/usages/react.js:L11
`

const goExpected = `
DevCycle Variable Usage:

1. hello-test
\t- test/samples/usages/golang.go:L1
`

describe('usages', () => {
    test
        .do(() => DVCFiles.setInstance(new MockDVCFiles()))
        .stdout()
        .command(['usages', '--include', 'test/samples/usages/nodejs.js'])
        .it('runs against a node test file', (ctx) => {
            expect(ctx.stdout).to.equal(nodeExpected)
        })

    test
        .do(() => DVCFiles.setInstance(new MockDVCFiles()))
        .stdout()
        .command(['usages', '--include', 'test/samples/usages/react.js'])
        .it('runs against a react test file', (ctx) => {
            expect(ctx.stdout).to.equal(reactExpected)
        })

    test
        .do(() => DVCFiles.setInstance(new MockDVCFiles()))
        .stdout()
        .command(['usages', '--include', 'test/samples/usages/golang.go'])
        .it('runs against a go test file', (ctx) => {
            expect(ctx.stdout).to.equal(goExpected)
        })
})
