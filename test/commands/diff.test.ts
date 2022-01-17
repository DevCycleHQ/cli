import {expect, test} from '@oclif/test'

describe('diff', () => {
  test
  .stdout()
  .command(['diff', '--file', './test/utils/diff/samples/nodeSampleDiff'])
  .it('runs against a test file', ctx => {
    expect(ctx.stdout).to.exist
  })
})
