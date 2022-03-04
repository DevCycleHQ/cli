import { BaseParser, MatchResult } from './BaseParser'
import { ParseOptions } from './types'

export class CustomParser extends BaseParser {
    identity = 'custom'
    variableMethodPattern = new RegExp('')
    customPatterns: string[]

    constructor(extension: string, options: ParseOptions) {
        super(extension, options)

        if (!options.matchPatterns || !(extension in options.matchPatterns)) {
            throw new Error(`No match pattern for ${extension}`)
        }

        this.customPatterns = options.matchPatterns[extension]
    }

    override match(content: string): MatchResult | null {
        let minIndex: number = Number.MAX_SAFE_INTEGER
        let minMatch: MatchResult | null = null

        for (const pattern of this.customPatterns) {
            const matches = new RegExp(pattern).exec(content)
            if (matches && minIndex > matches.index) {
                minIndex = matches.index
                const varName = (matches[1] || matches[2]).trim()
                minMatch = {
                    isUnknown: !varName.match(/^["'].*["']$/),
                    // position or named parameter match
                    name: varName.replace(/["']/g, ''),
                    content: matches[0],
                    index: matches.index
                }
            }
        }

        return minMatch
    }
}
