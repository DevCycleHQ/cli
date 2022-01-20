import { executeFileDiff } from '../../../src/utils/diff/fileDiff'
import * as path from 'node:path'
import { parseFiles } from '../../../src/utils/diff/parse'
import { expect } from '@oclif/test'

describe('nodejs', () => {
    const nodeSimpleMatchResult = [
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
            'line': 16,
            'mode': 'add',
            'name': 'single-comment'
        },
        {
            'fileName': 'test/utils/diff/sampleDiff.js',
            'line': 19,
            'mode': 'add',
            'name': 'multi-line-comment'
        },
        {
            'fileName': 'test/utils/diff/sampleDiff.js',
            'line': 1,
            'mode': 'remove',
            'name': 'simple-case'
        }]
    it('identifies the correct variable usages in the NodeJS sample diff', () => {
        const parsedDiff = executeFileDiff(path.join(__dirname, './samples/nodeSampleDiff'))
        const results = parseFiles(parsedDiff)

        expect(results).to.deep.equal({
            nodejs: nodeSimpleMatchResult,
        })
    })

    it('identifies the correct variables using an overridden client name', () => {
        const parsedDiff = executeFileDiff(path.join(__dirname, './samples/nodeSampleDiff'))
        const results = parseFiles(parsedDiff, { clientNames: ['dvc'] })
        expect(results).to.deep.equal({
            nodejs: [{
                'fileName': 'test/utils/diff/sampleDiff.js',
                'line': 23,
                'mode': 'add',
                'name': 'renamed-case'
            }]
        })
    })

    it('identifies the correct variables using multiple overridden client names', () => {
        const parsedDiff = executeFileDiff(path.join(__dirname, './samples/nodeSampleDiff'))
        const results = parseFiles(parsedDiff, { clientNames: ['dvc', 'dvcClient'] })
        expect(results).to.deep.equal({
            nodejs: [
                ...nodeSimpleMatchResult,
                {
                    'fileName': 'test/utils/diff/sampleDiff.js',
                    'line': 23,
                    'mode': 'add',
                    'name': 'renamed-case'
                }]
        })
    })

    it('identifies the correct variables using a custom pattern', () => {
        const parsedDiff = executeFileDiff(path.join(__dirname, './samples/nodeSampleDiff'))
        const results = parseFiles(parsedDiff, { matchPatterns: { js: 'checkVariable\\(\\w*,\\s*"([^"\']*)"' } })
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
})
