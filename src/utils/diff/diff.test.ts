import { constructFullDiffCommand } from './diff'
import { expect } from '@oclif/test'

describe('diff', () => {
    describe('constructFullDiffCommand', () => {
        it('constructs a diff command using the diff pattern and no file paths', () => {
            expect(constructFullDiffCommand('HEAD~1..HEAD', [])).to.equal(
                'git diff HEAD~1..HEAD > diff.txt',
            )
        })

        it('constructs a diff command including a list of files', () => {
            expect(
                constructFullDiffCommand('HEAD~1..HEAD', [
                    'test.ts',
                    'blah.ts',
                ]),
            ).to.equal(
                'git diff HEAD~1..HEAD -- "test.ts" "blah.ts" > diff.txt',
            )
        })
    })
})
