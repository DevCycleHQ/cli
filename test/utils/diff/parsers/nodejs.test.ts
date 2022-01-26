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
            'name': 'simple-case'
        },
        {
            'fileName': 'test/utils/diff/sampleDiff.js',
            'line': 2,
            'mode': 'add',
            'name': 'simple-case'
        },
        {
            'fileName': 'test/utils/diff/sampleDiff.js',
            'line': 4,
            'mode': 'add',
            'name': 'single-quotes'
        },
        {
            'fileName': 'test/utils/diff/sampleDiff.js',
            'line': 10,
            'mode': 'add',
            'name': 'multi-line'
        },
        {
            'fileName': 'test/utils/diff/sampleDiff.js',
            'line': 20,
            'mode': 'add',
            'name': 'multi-line-comment'
        }]
    const nodeSimpleMatchRemoved = [
        {
            'fileName': 'test/utils/diff/sampleDiff.js',
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
                    'line': 24,
                    'mode': 'add',
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
                    'line': 24,
                    'mode': 'add',
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
                    'name': 'optional-accessor'
                }
            ]
        })
    })
})
