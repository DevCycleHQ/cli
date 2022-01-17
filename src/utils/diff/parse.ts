import parse from 'parse-diff'
import { parseFile as parseNode } from './parsers/nodejs'
import { Parser, VariableMatch } from './parsers/types'

const PARSERS: Record<string, Parser[]> = {
    js: [parseNode],
    ts: [parseNode]
}

export const parseFiles = (files: parse.File[]): Record<string, VariableMatch[]> => {
    const resultsByLanguage: Record<string, VariableMatch[]> = {}

    for (const file of files) {
        const fileExtension = file.to?.split('.').pop() ?? ''
        const parsers = PARSERS[fileExtension] || []
        for (const parser of parsers) {
            const result = parser.parse(file)
            resultsByLanguage[parser.identity] ??= []
            resultsByLanguage[parser.identity].push(...result)
        }
    }

    return resultsByLanguage
}
