import parse from 'parse-diff'
import { Parser, VariableMatch } from '../types'
import { formatMatch } from '../common'

const findVariableRegex = /dvcClient\.variable\([\s\w]*,\s*["'](.*)["']/

export const parseFile: Parser = {
    parse: (file: parse.File): VariableMatch[] => {
        const results: VariableMatch[] = []
        for (const chunk of file.chunks) {
            for (const change of chunk.changes) {
                const match = findVariableRegex.exec(change.content)
                if (match) {
                    results.push(formatMatch(match[1], file, change))
                }
            }
        }

        return results
    },
    identity: 'nodejs',
}
