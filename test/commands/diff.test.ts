import {expect, test} from '@oclif/test'

jest.setTimeout(20000)

describe('diff', () => {
  test
  .stdout()
  .command(['diff'])
  .it('runs against a test file', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })
})
