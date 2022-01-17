import parse from 'parse-diff'
import { Parser } from '../types'

const findVariableRegex = /dvcClient\.variable\((?:\w|\s)*,\s*(?:"|')(.*)(?:"|')/

export const parseFile: Parser ={
    parse: (file: parse.File): string[] => {
        const results = []
        for (const chunk of file.chunks) {
            for (const change of chunk.changes) {
                const match = findVariableRegex.exec(change.content)
                if (match) {
                    results.push(match[1])
                }
            }
        }

        return results
    },
    identity: 'nodejs'
}
