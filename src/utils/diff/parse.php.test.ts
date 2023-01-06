import { executeFileDiff } from './fileDiff'
import * as path from 'node:path'
import { parseFiles } from './parse'
import { expect } from '@oclif/test'

describe('php', () => {
    const simpleMatchResult = [
        {
            'fileName': 'test/utils/diff/sampleDiff.php',
            'line': 1,
            'mode': 'add',
            'name': 'simple-case'
        },
        {
            'fileName': 'test/utils/diff/sampleDiff.php',
            'line': 3,
            'mode': 'add',
            'name': 'multi-line'
        },
        {
            'fileName': 'test/utils/diff/sampleDiff.php',
            'line': 9,
            'mode': 'add',
            'name': 'named-case'
        },
        {
            'fileName': 'test/utils/diff/sampleDiff.php',
            'line': 10,
            'mode': 'add',
            'name': 'user-object'
        },
        {
            'fileName': 'test/utils/diff/sampleDiff.php',
            'line': 11,
            'mode': 'add',
            'name': 'default-value-object'
        }
    ]
    it('identifies the correct variable usages in the PHP sample diff', () => {
        const parsedDiff = executeFileDiff(path.join(__dirname, '../samples/php'))
        const results = parseFiles(parsedDiff)

        expect(results).to.deep.equal({
            php: simpleMatchResult,
        })
    })
})
