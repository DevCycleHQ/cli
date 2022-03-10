import { executeFileDiff } from '../../../src/utils/diff/fileDiff'
import * as path from 'node:path'
import { parseFiles } from '../../../src/utils/diff/parse'
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
        },
        {
            'fileName': 'test/utils/diff/sampleDiff.java',
            'line': 10,
            'mode': 'add',
            'name': 'user-object'
        },
        {
            'fileName': 'test/utils/diff/sampleDiff.java',
            'line': 11,
            'mode': 'add',
            'name': 'hashmap-default-value'
        }
    ]
    it('identifies the correct variable usages in the Java sample diff', () => {
        const parsedDiff = executeFileDiff(path.join(__dirname, '../diff/samples/java'))
        const results = parseFiles(parsedDiff)

        expect(results).to.deep.equal({
            java: simpleMatchResult,
        })
    })
})
