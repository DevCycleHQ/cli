import { executeFileDiff } from './fileDiff'
import * as path from 'node:path'
import { parseFiles } from './parse'
import { expect } from '@oclif/test'

const samplePath = path.join(__dirname, '../../../test/samples/diff/java')

describe('java', () => {
    const simpleMatchResult = [
        {
            'fileName': 'test/samples/diff/sampleDiff.java',
            'line': 1,
            'mode': 'add',
            'name': 'simple-case'
        },
        {
            'fileName': 'test/samples/diff/sampleDiff.java',
            'line': 3,
            'mode': 'add',
            'name': 'multi-line'
        },
        {
            'fileName': 'test/samples/diff/sampleDiff.java',
            'line': 10,
            'mode': 'add',
            'name': 'user-object'
        },
        {
            'fileName': 'test/samples/diff/sampleDiff.java',
            'line': 11,
            'mode': 'add',
            'name': 'hashmap-default-value'
        }
    ]
    it('identifies the correct variable usages in the Java sample diff', () => {
        const parsedDiff = executeFileDiff(samplePath)
        const results = parseFiles(parsedDiff)

        expect(results).to.deep.equal({
            java: simpleMatchResult,
        })
    })
})
