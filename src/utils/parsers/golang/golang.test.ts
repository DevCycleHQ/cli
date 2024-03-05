import { executeFileDiff } from '../../diff/fileDiff'
import * as path from 'node:path'
import { parseFiles } from '../../diff/parse'
import { expect } from '@oclif/test'

describe('golang', () => {
    let simpleMatchResult = [
        {
            fileName: 'test-utils/fixtures/diff/sampleDiff.go',
            line: 1,
            mode: 'add',
            name: 'simple-case',
        },
        {
            fileName: 'test-utils/fixtures/diff/sampleDiff.go',
            line: 3,
            mode: 'add',
            name: 'multi-line',
        },
        {
            fileName: 'test-utils/fixtures/diff/sampleDiff.go',
            line: 9,
            mode: 'add',
            name: 'user-object',
        },
        {
            fileName: 'test-utils/fixtures/diff/sampleDiff.go',
            line: 10,
            mode: 'add',
            name: 'user-named-object',
        },
    ]
    simpleMatchResult = simpleMatchResult.concat(
        simpleMatchResult.map((match) => {
            return { ...match, line: match.line + 11 }
        }),
    )

    it('identifies the correct variable usages in the Go sample diff', () => {
        const parsedDiff = executeFileDiff(
            path.join(__dirname, '../../../../test-utils/fixtures/diff/golang'),
        )
        const results = parseFiles(parsedDiff)

        expect(results).to.deep.equal({
            golang: simpleMatchResult,
        })
    })
})
