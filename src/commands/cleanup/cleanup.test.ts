import { runCommand, captureOutput } from '@oclif/test'
import { expect } from 'chai'
import chai from 'chai'
import { jestSnapshotPlugin } from 'mocha-chai-jest-snapshot'
import { setCurrentTestFile } from '../../../test-utils'

describe('cleanup', () => {
    beforeEach(setCurrentTestFile(__filename))
    chai.use(jestSnapshotPlugin())

    it('refactors correctly when value=true', async () => {
        const { stdout } = await captureOutput(async () => {
            await runCommand([
                'cleanup',
                'simple-case',
                '--value',
                'true',
                '--type',
                'Boolean',
                '--include',
                'test-utils/fixtures/cleanup/javascript/test.js',
                '--output',
                'console',
            ])
        })
        expect(stdout).toMatchSnapshot()
    })

    it('refactors correctly when value=false', async () => {
        const { stdout } = await captureOutput(async () => {
            await runCommand([
                'cleanup',
                'simple-case',
                '--value',
                'false',
                '--type',
                'Boolean',
                '--include',
                'test-utils/fixtures/cleanup/javascript/test.js',
                '--output',
                'console',
            ])
        })
        expect(stdout).toMatchSnapshot()
    })

    it('refactors correctly when value is a number', async () => {
        const { stdout } = await captureOutput(async () => {
            await runCommand([
                'cleanup',
                'simple-case',
                '--value',
                '3',
                '--type',
                'Number',
                '--include',
                'test-utils/fixtures/cleanup/javascript/test.js',
                '--output',
                'console',
            ])
        })
        expect(stdout).toMatchSnapshot()
    })

    it('refactors correctly when value is a string', async () => {
        const { stdout } = await captureOutput(async () => {
            await runCommand([
                'cleanup',
                'simple-case',
                '--value',
                'My String',
                '--type',
                'String',
                '--include',
                'test-utils/fixtures/cleanup/javascript/test.js',
                '--output',
                'console',
            ])
        })
        expect(stdout).toMatchSnapshot()
    })

    it('refactors correctly when value is JSON', async () => {
        const { stdout } = await captureOutput(async () => {
            await runCommand([
                'cleanup',
                'simple-case',
                '--value',
                '{ "foo": "bar" }',
                '--type',
                'JSON',
                '--include',
                'test-utils/fixtures/cleanup/javascript/test.js',
                '--output',
                'console',
            ])
        })
        expect(stdout).toMatchSnapshot()
    })

    it('correctly replaces aliases', async () => {
        const { stdout } = await captureOutput(async () => {
            await runCommand([
                'cleanup',
                'simple-case',
                '--value',
                'false',
                '--type',
                'Boolean',
                '--include',
                'test-utils/fixtures/cleanup/javascript/test.js',
                '--var-alias',
                'SIMPLE_CASE=simple-case',
                '--output',
                'console',
            ])
        })
        expect(stdout).toMatchSnapshot()
    })
})
