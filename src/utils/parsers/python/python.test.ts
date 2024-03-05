import { executeFileDiff } from '../../diff/fileDiff'
import * as path from 'node:path'
import { parseFiles } from '../../diff/parse'
import { expect } from '@oclif/test'

describe('python', () => {
    let simpleMatchResult = [
        {
            fileName: 'test-utils/fixtures/diff/sampleDiff.py',
            line: 1,
            mode: 'add',
            name: 'simple-case',
        },
        {
            fileName: 'test-utils/fixtures/diff/sampleDiff.py',
            line: 2,
            mode: 'add',
            name: 'named-case',
        },
        {
            fileName: 'test-utils/fixtures/diff/sampleDiff.py',
            line: 3,
            mode: 'add',
            name: 'named-case-reversed',
        },
        {
            fileName: 'test-utils/fixtures/diff/sampleDiff.py',
            line: 4,
            mode: 'add',
            name: 'multi-line',
        },
        {
            fileName: 'test-utils/fixtures/diff/sampleDiff.py',
            line: 10,
            mode: 'add',
            name: 'user-object',
        },
    ]
    simpleMatchResult = simpleMatchResult.concat(
        simpleMatchResult.map((match) => {
            return { ...match, line: match.line + 11 }
        }),
    )

    it('identifies the correct variable usages in the Python sample diff', () => {
        const parsedDiff = executeFileDiff(
            path.join(__dirname, '../../../../test-utils/fixtures/diff/python'),
        )
        const results = parseFiles(parsedDiff)

        expect(results).to.deep.equal({
            python: simpleMatchResult,
        })
    })
})
