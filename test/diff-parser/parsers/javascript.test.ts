import { executeFileDiff } from '../../../src/utils/diff/fileDiff'
import * as path from 'node:path'
import { parseFiles } from '../../../src/utils/diff/parse'
import { expect } from '@oclif/test'

describe('javascript', () => {
    const simpleMatchResult = [
        {
            fileName: 'test-utils/fixtures/diff/sampleDiff.js',
            line: 1,
            mode: 'add',
            name: 'simple-case',
        },
        {
            fileName: 'test-utils/fixtures/diff/sampleDiff.js',
            line: 3,
            mode: 'add',
            name: 'multi-line',
        },
        {
            fileName: 'test-utils/fixtures/diff/sampleDiff.js',
            line: 8,
            mode: 'add',
            name: 'default-value-object',
        },
    ]
    it('identifies the correct variable usages in the JavaScript sample diff', () => {
        const parsedDiff = executeFileDiff(
            path.join(
                __dirname,
                '../../../test-utils/fixtures/diff/javascript',
            ),
        )
        const results = parseFiles(parsedDiff)

        expect(results).to.deep.equal({
            javascript: simpleMatchResult,
        })
    })
})
