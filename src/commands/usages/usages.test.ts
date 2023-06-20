import { expect, test } from '@oclif/test'
import chai from 'chai'
import { jestSnapshotPlugin } from 'mocha-chai-jest-snapshot'
import { setCurrentTestFile } from '../../../test-utils'

describe('usages', () => {
    beforeEach(setCurrentTestFile(__filename))
    chai.use(jestSnapshotPlugin())

    test
        .stdout()
        .command(['usages', '--include', 'test-utils/fixtures/usages/nodejs.js'])
        .it('runs against a node test file', (ctx) => {
            expect(ctx.stdout).toMatchSnapshot()
        })

    test
        .stdout()
        .command(['usages', '--include', 'test-utils/fixtures/usages/react.js'])
        .it('runs against a react test file', (ctx) => {
            expect(ctx.stdout).toMatchSnapshot()
        })

    test
        .stdout()
        .command(['usages', '--include', 'test-utils/fixtures/usages/golang.go'])
        .it('runs against a go test file', (ctx) => {
            expect(ctx.stdout).toMatchSnapshot()
        })

    test
        .stdout()
        .command(['usages', '--include', 'test-utils/fixtures/usages/sample.dart'])
        .it('runs against a dart test file', (ctx) => {
            expect(ctx.stdout).toMatchSnapshot()
        })
})
