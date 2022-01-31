import * as path from 'node:path'
import { expect } from '@oclif/test'
import { executeFileDiff } from '../../../src/utils/diff/fileDiff'
import { parseFiles } from '../../../src/utils/diff/parse'

describe('parse', () => {
    it('identifies no change when match is in normal line', () => {
        const parsedDiff = executeFileDiff(path.join(__dirname, './samples/no-change'))
        const results = parseFiles(parsedDiff)

        expect(results).to.deep.equal({})
    })

    describe('multi-line', () => {
        it('identifies an addition in a multi-line method call', () => {
            const parsedDiff = executeFileDiff(path.join(__dirname, './samples/multiline/addition'))
            const results = parseFiles(parsedDiff)

            expect(results).to.deep.equal({
                nodejs: [{
                    'fileName': 'services/api/src/organizations/organizations.controller.ts',
                    'line': 176,
                    'mode': 'add',
                    'kind': 'regular',
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
                    'kind': 'regular',
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
                    'kind': 'regular',
                    'name': 'new-variable'
                },
                {
                    'fileName': 'services/api/src/organizations/organizations.controller.ts',
                    'line': 176,
                    'mode': 'remove',
                    'kind': 'regular',
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
                    'kind': 'regular',
                    'name': 'variable-key'
                },
                {
                    'fileName': 'services/api/src/organizations/organizations.controller.ts',
                    'line': 176,
                    'mode': 'remove',
                    'kind': 'regular',
                    'name': 'variable-key'
                }],
            })
        })
    })

    describe('single comment', () => {
        it('identifies no change when addition is commented', () => {
            const parsedDiff = executeFileDiff(path.join(__dirname, './samples/comments/add-comment'))
            const results = parseFiles(parsedDiff)

            expect(results).to.deep.equal({})
        })

        it('identifies addition when line is uncommented', () => {
            const parsedDiff = executeFileDiff(path.join(__dirname, './samples/comments/uncomment'))
            const results = parseFiles(parsedDiff)

            expect(results).to.deep.equal({
                nodejs: [{
                    'fileName': 'services/api/src/organizations/organizations.controller.ts',
                    'line': 177,
                    'mode': 'add',
                    'kind': 'regular',
                    'name': 'variable-key'
                }]
            })
        })

        it('identifies deletion when line is commented', () => {
            const parsedDiff = executeFileDiff(path.join(__dirname, './samples/comments/comment'))
            const results = parseFiles(parsedDiff)

            expect(results).to.deep.equal({
                nodejs: [{
                    'fileName': 'services/api/src/organizations/organizations.controller.ts',
                    'line': 177,
                    'mode': 'remove',
                    'kind': 'regular',
                    'name': 'variable-key'
                }]
            })
        })

        it('identifies change when parameter is commented', () => {
            const parsedDiff = executeFileDiff(path.join(__dirname, './samples/comments/param-comment'))
            const results = parseFiles(parsedDiff)

            expect(results).to.deep.equal({
                nodejs: [
                    {
                        'fileName': 'services/api/src/organizations/organizations.controller.ts',
                        'line': 177,
                        'mode': 'add',
                        'kind': 'regular',
                        'name': 'new-variable'
                    },
                    {
                        'fileName': 'services/api/src/organizations/organizations.controller.ts',
                        'line': 177,
                        'mode': 'remove',
                        'kind': 'regular',
                        'name': 'variable-key'
                    }
                ]
            })
        })
    })
})
