import * as path from 'node:path'
import { expect } from '@oclif/test'
import { executeFileDiff } from '../../../src/utils/diff/fileDiff'
import { parseFiles } from '../../../src/utils/diff/parse'

describe('multi-line', () => {
    it('identifies an addition in a multi-line method call', () => {
        const parsedDiff = executeFileDiff(path.join(__dirname, './samples/multiline/addition'))
        const results = parseFiles(parsedDiff)

        expect(results).to.deep.equal({
            nodejs: [{
                'fileName': 'services/api/src/organizations/organizations.controller.ts',
                'line': 176,
                'mode': 'add',
                'name': 'variable-key'
            }],
        })
    })

    it('identifies a deletion in a multi-line method call', () => {
        const parsedDiff = executeFileDiff(path.join(__dirname, './samples/multiline/deletion'))
        const results = parseFiles(parsedDiff)

        expect(results).to.deep.equal({
            nodejs: [{
                'fileName': 'services/api/src/organizations/organizations.controller.ts',
                'line': 176,
                'mode': 'remove',
                'name': 'variable-key'
            }],
        })
    })

    it('identifies a variable key change in a multi-line method call', () => {
        const parsedDiff = executeFileDiff(path.join(__dirname, './samples/multiline/key-modification'))
        const results = parseFiles(parsedDiff)

        expect(results).to.deep.equal({
            nodejs: [{
                'fileName': 'services/api/src/organizations/organizations.controller.ts',
                'line': 176,
                'mode': 'add',
                'name': 'new-variable'
            },
            {
                'fileName': 'services/api/src/organizations/organizations.controller.ts',
                'line': 176,
                'mode': 'remove',
                'name': 'variable-key'
            }],
        })
    })

    it('identifies a default value change in a multi-line method call', () => {
        const parsedDiff = executeFileDiff(path.join(__dirname, './samples/multiline/default-modification'))
        const results = parseFiles(parsedDiff)

        expect(results).to.deep.equal({
            nodejs: [{
                'fileName': 'services/api/src/organizations/organizations.controller.ts',
                'line': 176,
                'mode': 'add',
                'name': 'variable-key'
            },
            {
                'fileName': 'services/api/src/organizations/organizations.controller.ts',
                'line': 176,
                'mode': 'remove',
                'name': 'variable-key'
            }],
        })
    })
})
