import { executeFileDiff } from '../../../../src/utils/diff/fileDiff'
import * as path from 'node:path'
import { parseFiles } from '../../../../src/utils/diff/parse'
import { expect } from '@oclif/test'

describe('ios', () => {
    const simpleMatchResult = [
        {
            'fileName': 'test/utils/diff/sampleDiff.swift',
            'line': 1,
            'kind': 'regular',
            'mode': 'add',
            'name': 'simple-case'
        },
        {
            'fileName': 'test/utils/diff/sampleDiff.swift',
            'line': 3,
            'kind': 'regular',
            'mode': 'add',
            'name': 'multi-line'
        },
        {
            'fileName': 'test/utils/diff/sampleDiff.swift',
            'line': 9,
            'mode': 'add',
            'kind': 'regular',
            'name': 'default-value-object'
        }
    ]
    it('identifies the correct variable usages in the iOS sample diff', () => {
        const parsedDiff = executeFileDiff(path.join(__dirname, '../samples/ios'))
        const results = parseFiles(parsedDiff)

        expect(results).to.deep.equal({
            ios: simpleMatchResult,
        })
    })
})
