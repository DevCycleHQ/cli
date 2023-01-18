import { executeFileDiff } from './fileDiff'
import * as path from 'node:path'
import { parseFiles } from './parse'
import { expect } from '@oclif/test'

const samplePath = path.join(__dirname, '../../../test/samples/diff/golang')

describe('golang', () => {
    const simpleMatchResult = [
        {
            'fileName': 'test/samples/diff/sampleDiff.go',
            'line': 1,
            'mode': 'add',
            'name': 'simple-case'
        },
        {
            'fileName': 'test/samples/diff/sampleDiff.go',
            'line': 3,
            'mode': 'add',
            'name': 'multi-line'
        },
        {
            'fileName': 'test/samples/diff/sampleDiff.go',
            'line': 11,
            'mode': 'add',
            'name': 'user-object'
        },
        {
            'fileName': 'test/samples/diff/sampleDiff.go',
            'line': 12,
            'mode': 'add',
            'name': 'user-named-object'
        }
    ]
    it('identifies the correct variable usages in the Go sample diff', () => {
        const parsedDiff = executeFileDiff(samplePath)
        const results = parseFiles(parsedDiff)

        expect(results).to.deep.equal({
            golang: simpleMatchResult,
        })
    })
})
