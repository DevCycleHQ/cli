import { executeFileDiff } from './fileDiff'
import * as path from 'node:path'
import { parseFiles } from './parse'
import { expect } from '@oclif/test'

const samplePath = path.join(__dirname, '../../../test/samples/diff/python')

describe('python', () => {
    const simpleMatchResult = [
        {
            'fileName': 'test/samples/diff/sampleDiff.py',
            'line': 1,
            'mode': 'add',
            'name': 'simple-case'
        },
        {
            'fileName': 'test/samples/diff/sampleDiff.py',
            'line': 2,
            'mode': 'add',
            'name': 'named-case'
        },
        {
            'fileName': 'test/samples/diff/sampleDiff.py',
            'line': 3,
            'mode': 'add',
            'name': 'named-case-reversed'
        },
        {
            'fileName': 'test/samples/diff/sampleDiff.py',
            'line': 4,
            'mode': 'add',
            'name': 'multi-line'
        },
        {
            'fileName': 'test/samples/diff/sampleDiff.py',
            'line': 10,
            'mode': 'add',
            'name': 'user-object'
        }
    ]

    it('identifies the correct variable usages in the Python sample diff', () => {
        const parsedDiff = executeFileDiff(samplePath)
        const results = parseFiles(parsedDiff)

        expect(results).to.deep.equal({
            python: simpleMatchResult,
        })
    })
})
