import { executeFileDiff } from '../../../../src/utils/diff/fileDiff'
import * as path from 'node:path'
import { parseFiles } from '../../../../src/utils/diff/parse'
import { expect } from '@oclif/test'

describe('react', () => {
    const simpleMatchResult = [
        {
            'fileName': 'test/utils/diff/sampleDiff.jsx',
            'line': 1,
            'mode': 'add',
            'name': 'simple-case'
        },
        {
            'fileName': 'test/utils/diff/sampleDiff.jsx',
            'line': 3,
            'mode': 'add',
            'name': 'multi-line'
        },
        {
            'fileName': 'test/utils/diff/sampleDiff.jsx',
            'isUnknown': true,
            'line': 8,
            'mode': 'add',
            'name': 'ALIASED_VARIABLE'
        }
    ]
    it('identifies the correct variable usages in the React sample diff', () => {
        const parsedDiff = executeFileDiff(path.join(__dirname, '../samples/react'))
        const results = parseFiles(parsedDiff)

        expect(results).to.deep.equal({
            react: simpleMatchResult,
        })
    })
})
