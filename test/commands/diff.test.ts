import { expect, test } from '@oclif/test'

describe('diff', () => {
    test
        .stdout()
        .command(['diff', '--file', './test/utils/diff/samples/nodeSampleDiff'])
        .it('runs against a test file', (ctx) => {
            expect(JSON.parse(ctx.stdout)).to.deep.equal({
                nodejs: [
                    {
                        'fileName': 'test/utils/diff/sampleDiff.js',
                        'line': 1,
                        'mode': 'add',
                        'name': 'simple-case'
                    },
                    {
                        'fileName': 'test/utils/diff/sampleDiff.js',
                        'line': 3,
                        'mode': 'add',
                        'name': 'single-quotes'
                    },
                    {
                        'fileName': 'test/utils/diff/sampleDiff.js',
                        'line': 15,
                        'mode': 'add',
                        'name': 'single-comment'
                    },
                    {
                        'fileName': 'test/utils/diff/sampleDiff.js',
                        'line': 18,
                        'mode': 'add',
                        'name': 'multi-line-comment'
                    }]
            })
        })
})
