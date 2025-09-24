import { test } from '@oclif/test'
import { expect } from 'vitest'

describe('cleanup', () => {
    test.stdout()
        .command([
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
        .it('refactors correctly when value=true', (ctx) => {
            expect(ctx.stdout).toMatchSnapshot()
        })

    test.stdout()
        .command([
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
        .it('refactors correctly when value=false', (ctx) => {
            expect(ctx.stdout).toMatchSnapshot()
        })

    test.stdout()
        .command([
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
        .it('refactors correctly when value is a number', (ctx) => {
            expect(ctx.stdout).toMatchSnapshot()
        })

    test.stdout()
        .command([
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
        .it('refactors correctly when value is a string', (ctx) => {
            expect(ctx.stdout).toMatchSnapshot()
        })

    test.stdout()
        .command([
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
        .it('refactors correctly when value is JSON', (ctx) => {
            expect(ctx.stdout).toMatchSnapshot()
        })

    test.stdout()
        .command([
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
        .it('correctly replaces aliases', (ctx) => {
            expect(ctx.stdout).toMatchSnapshot()
        })
})
