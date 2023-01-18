import { executeFileDiff } from './fileDiff'
import * as path from 'node:path'
import { parseFiles } from './parse'
import { expect } from '@oclif/test'

const samplePath = path.join(__dirname, '../../../test/samples/diff/csharp')

describe('csharp', () => {
    const simpleMatchResult = [
        {
            'fileName': 'test/samples/diff/sampleDiff.cs',
            'line': 1,
            'mode': 'add',
            'name': 'simple-case'
        },
        {
            'fileName': 'test/samples/diff/sampleDiff.cs',
            'line': 3,
            'mode': 'add',
            'name': 'multi-line'
        },
        {
            'fileName': 'test/samples/diff/sampleDiff.cs',
            'line': 10,
            'mode': 'add',
            'name': 'user-object'
        },
        {
            'fileName': 'test/samples/diff/sampleDiff.cs',
            'line': 11,
            'mode': 'add',
            'name': 'named-case'
        },
        {
            'fileName': 'test/samples/diff/sampleDiff.cs',
            'line': 12,
            'mode': 'add',
            'name': 'unordered-named-case'
        },
        {
            'fileName': 'test/samples/diff/sampleDiff.cs',
            'line': 13,
            'mode': 'add',
            'name': 'default-value-object'
        }
    ]
    it('identifies the correct variable usages in the C# sample diff', () => {
        const parsedDiff = executeFileDiff(samplePath)
        const results = parseFiles(parsedDiff)

        expect(results).to.deep.equal({
            csharp: simpleMatchResult,
        })
    })
})
