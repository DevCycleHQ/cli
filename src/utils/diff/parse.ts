import parse from 'parse-diff'
import { NodeParser } from './parsers/nodejs'
import { VariableMatch } from './parsers/types'
import { BaseParser } from './parsers/common'

const nodeParser = new NodeParser()

const PARSERS: Record<string, BaseParser[]> = {
    js: [nodeParser],
    ts: [nodeParser]
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
