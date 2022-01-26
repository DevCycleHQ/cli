import { executeFileDiff } from '../../../../src/utils/diff/fileDiff'
import * as path from 'node:path'
import { parseFiles } from '../../../../src/utils/diff/parse'
import { expect } from '@oclif/test'

describe('java', () => {
    const simpleMatchResult = [
        {
            'fileName': 'test/utils/diff/sampleDiff.java',
            'line': 1,
            'mode': 'add',
            'name': 'simple-case'
        },
        {
            'fileName': 'test/utils/diff/sampleDiff.java',
            'line': 3,
            'mode': 'add',
            'name': 'multi-line'
        }
    ]
    it('identifies the correct variable usages in the Java sample diff', () => {
        const parsedDiff = executeFileDiff(path.join(__dirname, '../samples/java'))
        const results = parseFiles(parsedDiff)

        expect(results).to.deep.equal({
            java: simpleMatchResult,
        })
    })
})
