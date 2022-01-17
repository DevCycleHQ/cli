import parse from 'parse-diff'
import {parseFile as parseNode} from './parsers/nodejs'
import {Parser} from './parsers/types'

const PARSERS: Record<any, Parser[]> = {
  js: [parseNode],
}

export const parseFiles = (files: parse.File[]) => {
  const resultsByLanguage: Record<string, string[]> = {}

  for (const file of files) {
    const parsers = PARSERS[file.to?.split('.').pop() ?? ''] || []
    for (const parser of parsers) {
      const result = parser.parse(file)
      resultsByLanguage[parser.identity] ??= []
      resultsByLanguage[parser.identity].push(...result)
    }
  }

  return resultsByLanguage
}
