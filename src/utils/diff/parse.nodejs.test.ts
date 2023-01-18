import { executeFileDiff } from './fileDiff'
import * as path from 'node:path'
import { parseFiles } from './parse'
import { expect } from '@oclif/test'

const makeSamplePath = (sample: string) =>
    path.join(__dirname, '../../../test/samples/diff', sample)

describe('nodejs', () => {
    const nodeSimpleMatchAdded = [
        {
            'fileName': 'test/samples/diff/sampleDiff.js',
            'line': 1,
            'mode': 'add',
            'name': 'simple-case'
        },
        {
            'fileName': 'test/samples/diff/sampleDiff.js',
            'line': 2,
            'mode': 'add',
            'name': 'simple-case'
        },
        {
            'fileName': 'test/samples/diff/sampleDiff.js',
            'line': 4,
            'mode': 'add',
            'name': 'single-quotes'
        },
        {
            'fileName': 'test/samples/diff/sampleDiff.js',
            'line': 10,
            'mode': 'add',
            'name': 'multi-line'
        },
        {
            'fileName': 'test/samples/diff/sampleDiff.js',
            'line': 20,
            'mode': 'add',
            'name': 'multi-line-comment'
        },
        {
            'fileName': 'test/samples/diff/sampleDiff.js',
            'line': 23,
            'mode': 'add',
            'name': 'user-object'
        },
        {
            'fileName': 'test/samples/diff/sampleDiff.js',
            'line': 24,
            'mode': 'add',
            'name': 'user-constructor'
        },
        {
            'fileName': 'test/samples/diff/sampleDiff.js',
            'line': 25,
            'mode': 'add',
            'name': 'multi-line-user-object'
        },
        {
            'fileName': 'test/samples/diff/sampleDiff.js',
            'line': 33,
            'mode': 'add',
            'isUnknown': true,
            'name': 'VARIABLES.ENUM_VARIABLE'
        }
    ]
    const nodeSimpleMatchRemoved = [
        {
            'fileName': 'test/samples/diff/sampleDiff.js',
            'line': 1,
            'mode': 'remove',
            'name': 'simple-case'
        }
    ]
    const nodeSimpleMatchResult = [
        ...nodeSimpleMatchAdded,
        ...nodeSimpleMatchRemoved
    ]
    it('identifies the correct variable usages in the NodeJS sample diff', () => {
        const parsedDiff = executeFileDiff(makeSamplePath('nodejs'))
        const results = parseFiles(parsedDiff)

        expect(results).to.deep.equal({
            nodejs: nodeSimpleMatchResult,
        })
    })

    it('identifies the correct variables using an overridden client name', () => {
        const parsedDiff = executeFileDiff(makeSamplePath('nodejs'))
        const results = parseFiles(parsedDiff, { clientNames: ['dvc'] })
        expect(results).to.deep.equal({
            nodejs: [
                ...nodeSimpleMatchAdded,
                {
                    'fileName': 'test/samples/diff/sampleDiff.js',
                    'line': 34,
                    'mode': 'add',
                    'name': 'renamed-case'
                },
                ...nodeSimpleMatchRemoved
            ]
        })
    })

    it('identifies the correct variables using multiple overridden client names', () => {
        const parsedDiff = executeFileDiff(makeSamplePath('nodejs'))
        const results = parseFiles(parsedDiff, { clientNames: ['dvc', 'dvcClient'] })
        expect(results).to.deep.equal({
            nodejs: [
                ...nodeSimpleMatchAdded,
                {
                    'fileName': 'test/samples/diff/sampleDiff.js',
                    'line': 34,
                    'mode': 'add',
                    'name': 'renamed-case'
                },
                ...nodeSimpleMatchRemoved
            ]
        })
    })

    it('identifies the correct variables using a custom pattern', () => {
        const parsedDiff = executeFileDiff(makeSamplePath('nodejs'))
        const results = parseFiles(parsedDiff, { matchPatterns: { js: ['checkVariable\\(\\w*,\\s*([^,)]*)\\s*'] } })
        expect(results).to.deep.equal({
            nodejs: nodeSimpleMatchResult,
            'custom js': [
                {
                    'fileName': 'test/samples/diff/sampleDiff.js',
                    'line': 6,
                    'mode': 'add',
                    'name': 'func-proxy'
                }]
        })
    })

    it('identifies the correct variables using multiple custom patterns that match out-of-order', () => {
        const parsedDiff = executeFileDiff(makeSamplePath('nodejs'))
        const results = parseFiles(parsedDiff, {
            matchPatterns: {
                js: ['myClient.variable\\(\\w*,\\s*([^,)]*)\\s*', 'checkVariable\\(\\w*,\\s*([^,)]*)\\s*']
            }
        })
        expect(results).to.deep.equal({
            nodejs: nodeSimpleMatchResult,
            'custom js': [
                {
                    'fileName': 'test/samples/diff/sampleDiff.js',
                    'line': 6,
                    'mode': 'add',
                    'name': 'func-proxy'
                },
                {
                    'fileName': 'test/samples/diff/sampleDiff.js',
                    'line': 8,
                    'mode': 'add',
                    'name': 'alias-case'
                }
            ]
        })
    })

    it('identifies optional accessors', () => {
        const parsedDiff = executeFileDiff(makeSamplePath('optional-accessor'))
        const results = parseFiles(parsedDiff)
        expect(results).to.deep.equal({
            nodejs: [
                {
                    'fileName': 'services/api/src/organizations/organizations.controller.ts',
                    'line': 177,
                    'mode': 'add',
                    'name': 'optional-accessor'
                }
            ]
        })
    })

    it('identifies unknown variables', () => {
        const parsedDiff = executeFileDiff(makeSamplePath('aliases/aliased'))
        const results = parseFiles(parsedDiff)
        expect(results).to.deep.equal({
            nodejs: [
                {
                    'fileName': 'test/samples/diff/sampleDiff.js',
                    'line': 1,
                    'mode': 'add',
                    'isUnknown': true,
                    'name': 'SOME_ADDITION'
                },
                {
                    'fileName': 'test/samples/diff/sampleDiff.js',
                    'line': 1,
                    'mode': 'remove',
                    'isUnknown': true,
                    'name': 'VARIABLES.SOME_REMOVAL'
                }
            ]
        })
    })
})
