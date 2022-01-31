import { executeFileDiff } from '../../../../src/utils/diff/fileDiff'
import * as path from 'node:path'
import { parseFiles } from '../../../../src/utils/diff/parse'
import { expect } from '@oclif/test'

describe('nodejs', () => {
    const nodeSimpleMatchAdded = [
        {
            'fileName': 'test/utils/diff/sampleDiff.js',
            'line': 1,
            'mode': 'add',
            'kind': 'regular',
            'name': 'simple-case'
        },
        {
            'fileName': 'test/utils/diff/sampleDiff.js',
            'line': 2,
            'mode': 'add',
            'kind': 'regular',
            'name': 'simple-case'
        },
        {
            'fileName': 'test/utils/diff/sampleDiff.js',
            'line': 4,
            'mode': 'add',
            'kind': 'regular',
            'name': 'single-quotes'
        },
        {
            'fileName': 'test/utils/diff/sampleDiff.js',
            'line': 10,
            'mode': 'add',
            'kind': 'regular',
            'name': 'multi-line'
        },
        {
            'fileName': 'test/utils/diff/sampleDiff.js',
            'line': 20,
            'mode': 'add',
            'kind': 'regular',
            'name': 'multi-line-comment'
        },
        {
            'fileName': 'test/utils/diff/sampleDiff.js',
            'line': 23,
            'mode': 'add',
            'kind': 'regular',
            'name': 'user-object'
        },
        {
            'fileName': 'test/utils/diff/sampleDiff.js',
            'line': 24,
            'mode': 'add',
            'kind': 'regular',
            'name': 'user-constructor'
        },
        {
            'fileName': 'test/utils/diff/sampleDiff.js',
            'line': 25,
            'mode': 'add',
            'kind': 'regular',
            'name': 'multi-line-user-object'
        },
        {
            'fileName': 'test/utils/diff/sampleDiff.js',
            'line': 33,
            'mode': 'add',
            'kind': 'unknown',
            'name': 'VARIABLES.ENUM_VARIABLE'
        }
    ]
    const nodeSimpleMatchRemoved = [
        {
            'fileName': 'test/utils/diff/sampleDiff.js',
            'line': 1,
            'mode': 'remove',
            'kind': 'regular',
            'name': 'simple-case'
        }
    ]
    const nodeSimpleMatchResult = [
        ...nodeSimpleMatchAdded,
        ...nodeSimpleMatchRemoved
    ]
    it('identifies the correct variable usages in the NodeJS sample diff', () => {
        const parsedDiff = executeFileDiff(path.join(__dirname, '../samples/nodejs'))
        const results = parseFiles(parsedDiff)

        expect(results).to.deep.equal({
            nodejs: nodeSimpleMatchResult,
        })
    })

    it('identifies the correct variables using an overridden client name', () => {
        const parsedDiff = executeFileDiff(path.join(__dirname, '../samples/nodejs'))
        const results = parseFiles(parsedDiff, { clientNames: ['dvc'] })
        expect(results).to.deep.equal({
            nodejs: [
                ...nodeSimpleMatchAdded,
                {
                    'fileName': 'test/utils/diff/sampleDiff.js',
                    'line': 34,
                    'mode': 'add',
                    'kind': 'regular',
                    'name': 'renamed-case'
                },
                ...nodeSimpleMatchRemoved
            ]
        })
    })

    it('identifies the correct variables using multiple overridden client names', () => {
        const parsedDiff = executeFileDiff(path.join(__dirname, '../samples/nodejs'))
        const results = parseFiles(parsedDiff, { clientNames: ['dvc', 'dvcClient'] })
        expect(results).to.deep.equal({
            nodejs: [
                ...nodeSimpleMatchAdded,
                {
                    'fileName': 'test/utils/diff/sampleDiff.js',
                    'line': 34,
                    'mode': 'add',
                    'kind': 'regular',
                    'name': 'renamed-case'
                },
                ...nodeSimpleMatchRemoved
            ]
        })
    })

    it('identifies the correct variables using a custom pattern', () => {
        const parsedDiff = executeFileDiff(path.join(__dirname, '../samples/nodejs'))
        const results = parseFiles(parsedDiff, { matchPatterns: { js: ['checkVariable\\(\\w*,\\s*"([^"\']*)"'] } })
        expect(results).to.deep.equal({
            nodejs: nodeSimpleMatchResult,
            custom: [
                {
                    'fileName': 'test/utils/diff/sampleDiff.js',
                    'line': 6,
                    'mode': 'add',
                    'kind': 'regular',
                    'name': 'func-proxy'
                }]
        })
    })

    it('identifies optional accessors', () => {
        const parsedDiff = executeFileDiff(path.join(__dirname, '../samples/optional-accessor'))
        const results = parseFiles(parsedDiff)
        expect(results).to.deep.equal({
            nodejs: [
                {
                    'fileName': 'services/api/src/organizations/organizations.controller.ts',
                    'line': 177,
                    'mode': 'add',
                    'kind': 'regular',
                    'name': 'optional-accessor'
                }
            ]
        })
    })

    it('identifies unknown variables', () => {
        const parsedDiff = executeFileDiff(path.join(__dirname, '../samples/aliases/aliased'))
        const results = parseFiles(parsedDiff)
        expect(results).to.deep.equal({
            nodejs: [
                {
                    'fileName': 'test/utils/diff/sampleDiff.js',
                    'line': 1,
                    'mode': 'add',
                    'kind': 'unknown',
                    'name': 'SOME_ADDITION'
                },
                {
                    'fileName': 'test/utils/diff/sampleDiff.js',
                    'line': 1,
                    'mode': 'remove',
                    'kind': 'unknown',
                    'name': 'VARIABLES.SOME_REMOVAL'
                }
            ]
        })
    })
})
