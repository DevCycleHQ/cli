import {executeFileDiff} from '../../../src/utils/diff/fileDiff'
import * as path from 'node:path'
import {parseFiles} from '../../../src/utils/diff/parse'
import {expect} from '@oclif/test'

describe('nodejs', () => {
  it('identifies the correct variable usages in the NodeJS sample diff', () => {
    const parsedDiff = executeFileDiff(path.join(__dirname, './samples/nodeSampleDiff'))
    const results = parseFiles(parsedDiff)

    expect(results).to.deep.equal({
      nodejs: ['simple-case', 'single-quotes', 'single-comment', 'multi-line-comment'],
    })
  })
})
