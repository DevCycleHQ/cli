import { executeFileDiff } from './fileDiff'
import * as path from 'node:path'
import { parseFiles } from './parse'
import { expect } from '@oclif/test'

const samplePath = path.join(__dirname, '../../../test/samples/diff/react')

describe('react', () => {
    const simpleMatchResult = [
        {
            'fileName': 'test/samples/diff/sampleDiff.jsx',
            'line': 1,
            'mode': 'add',
            'name': 'simple-case'
        },
        {
            'fileName': 'test/samples/diff/sampleDiff.jsx',
            'line': 3,
            'mode': 'add',
            'name': 'multi-line'
        },
        {
            'fileName': 'test/samples/diff/sampleDiff.jsx',
            'isUnknown': true,
            'line': 8,
            'mode': 'add',
            'name': 'ALIASED_VARIABLE'
        }
    ]
    it('identifies the correct variable usages in the React sample diff', () => {
        const parsedDiff = executeFileDiff(samplePath)
        const results = parseFiles(parsedDiff)

        expect(results).to.deep.equal({
            react: simpleMatchResult,
        })
    })
})
