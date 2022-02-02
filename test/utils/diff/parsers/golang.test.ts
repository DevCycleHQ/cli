import { executeFileDiff } from '../../../../src/utils/diff/fileDiff'
import * as path from 'node:path'
import { parseFiles } from '../../../../src/utils/diff/parse'
import { expect } from '@oclif/test'

describe('golang', () => {
    const simpleMatchResult = [
        {
            'fileName': 'test/utils/diff/sampleDiff.go',
            'line': 1,
            'mode': 'add',
            'name': 'simple-case'
        },
        {
            'fileName': 'test/utils/diff/sampleDiff.go',
            'line': 3,
            'mode': 'add',
            'name': 'multi-line'
        },
        {
            'fileName': 'test/utils/diff/sampleDiff.go',
            'line': 11,
            'mode': 'add',
            'name': 'user-object'
        },
        {
            'fileName': 'test/utils/diff/sampleDiff.go',
            'line': 12,
            'mode': 'add',
            'name': 'user-named-object'
        }
    ]
    it('identifies the correct variable usages in the Go sample diff', () => {
        const parsedDiff = executeFileDiff(path.join(__dirname, '../samples/golang'))
        const results = parseFiles(parsedDiff)

        expect(results).to.deep.equal({
            golang: simpleMatchResult,
        })
    })
})
