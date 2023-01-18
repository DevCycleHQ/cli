import { executeFileDiff } from './fileDiff'
import * as path from 'node:path'
import { parseFiles } from './parse'
import { expect } from '@oclif/test'

const samplePath = path.join(__dirname, '../../../test/samples/diff/ruby')

describe('ruby', () => {
    const simpleMatchResult = [
        {
            'fileName': 'test/samples/diff/sampleDiff.rb',
            'line': 1,
            'mode': 'add',
            'name': 'simple-case'
        },
        {
            'fileName': 'test/samples/diff/sampleDiff.rb',
            'line': 3,
            'mode': 'add',
            'name': 'multi-line'
        },
        {
            'fileName': 'test/samples/diff/sampleDiff.rb',
            'line': 9,
            'mode': 'add',
            'name': 'user-object'
        }
    ]
    it('identifies the correct variable usages in the Ruby sample diff', () => {
        const parsedDiff = executeFileDiff(samplePath)
        const results = parseFiles(parsedDiff)

        expect(results).to.deep.equal({
            ruby: simpleMatchResult,
        })
    })
})
