import * as path from 'node:path'
import { expect } from '@oclif/test'
import { executeFileDiff } from './fileDiff'
import { parseFiles } from './parse'

describe('parse', () => {
    it('identifies no change when match is in normal line', () => {
        const parsedDiff = executeFileDiff(path.join(__dirname, '../../../test-utils/fixtures/diff/no-change'))
        const results = parseFiles(parsedDiff)

        expect(results).to.deep.equal({})
    })

    describe('multi-line', () => {
        it('identifies an addition in a multi-line method call', () => {
            const parsedDiff = executeFileDiff(
                path.join(__dirname, '../../../test-utils/fixtures/diff/multiline/addition')
            )
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
            const parsedDiff = executeFileDiff(
                path.join(__dirname, '../../../test-utils/fixtures/diff/multiline/deletion')
            )
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
            const parsedDiff = executeFileDiff(
                path.join(__dirname, '../../../test-utils/fixtures/diff/multiline/key-modification')
            )
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
            const parsedDiff = executeFileDiff(
                path.join(__dirname, '../../../test-utils/fixtures/diff/multiline/default-modification')
            )
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

    describe('single comment', () => {
        it('identifies no change when addition is commented', () => {
            const parsedDiff = executeFileDiff(
                path.join(__dirname, '../../../test-utils/fixtures/diff/comments/add-comment')
            )
            const results = parseFiles(parsedDiff)

            expect(results).to.deep.equal({})
        })

        it('identifies addition when line is uncommented', () => {
            const parsedDiff = executeFileDiff(
                path.join(__dirname, '../../../test-utils/fixtures/diff/comments/uncomment')
            )
            const results = parseFiles(parsedDiff)

            expect(results).to.deep.equal({
                nodejs: [{
                    'fileName': 'services/api/src/organizations/organizations.controller.ts',
                    'line': 177,
                    'mode': 'add',
                    'name': 'variable-key'
                }]
            })
        })

        it('identifies deletion when line is commented', () => {
            const parsedDiff = executeFileDiff(
                path.join(__dirname, '../../../test-utils/fixtures/diff/comments/comment')
            )
            const results = parseFiles(parsedDiff)

            expect(results).to.deep.equal({
                nodejs: [{
                    'fileName': 'services/api/src/organizations/organizations.controller.ts',
                    'line': 177,
                    'mode': 'remove',
                    'name': 'variable-key'
                }]
            })
        })

        it('identifies change when parameter is commented', () => {
            const parsedDiff = executeFileDiff(
                path.join(__dirname, '../../../test-utils/fixtures/diff/comments/param-comment')
            )
            const results = parseFiles(parsedDiff)

            expect(results).to.deep.equal({
                nodejs: [
                    {
                        'fileName': 'services/api/src/organizations/organizations.controller.ts',
                        'line': 177,
                        'mode': 'add',
                        'name': 'new-variable'
                    },
                    {
                        'fileName': 'services/api/src/organizations/organizations.controller.ts',
                        'line': 177,
                        'mode': 'remove',
                        'name': 'variable-key'
                    }
                ]
            })
        })
    })
})
