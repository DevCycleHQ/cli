import { executeFileDiff } from '../../../../src/utils/diff/fileDiff'
import * as path from 'node:path'
import { parseFiles } from '../../../../src/utils/diff/parse'
import { expect } from '@oclif/test'

describe('python', () => {
    const simpleMatchResult = [
        {
            'fileName': 'test/utils/diff/sampleDiff.py',
            'line': 1,
            'mode': 'add',
            'name': 'simple-case'
        },
        {
            'fileName': 'test/utils/diff/sampleDiff.py',
            'line': 2,
            'mode': 'add',
            'name': 'named-case'
        },
        {
            'fileName': 'test/utils/diff/sampleDiff.py',
            'line': 3,
            'mode': 'add',
            'name': 'named-case-reversed'
        },
        {
            'fileName': 'test/utils/diff/sampleDiff.py',
            'line': 4,
            'mode': 'add',
            'name': 'multi-line'
        },
    ]

    it('identifies the correct variable usages in the Python sample diff', () => {
        const parsedDiff = executeFileDiff(path.join(__dirname, '../samples/python'))
        const results = parseFiles(parsedDiff)

        expect(results).to.deep.equal({
            python: simpleMatchResult,
        })
    })
})
