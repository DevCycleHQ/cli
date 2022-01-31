import { BaseParser } from './common'
import { MatchKind, ParseOptions } from './types'

export class CustomParser extends BaseParser {
    identity = 'custom'
    variableMethodPattern = new RegExp('')
    customPatterns: string[]
    variableParamPosition = null

    constructor(extension: string, options: ParseOptions) {
        super(extension, options)

        if (!options.matchPatterns || !(extension in options.matchPatterns)) {
            throw new Error(`No match pattern for ${extension}`)
        }

        this.customPatterns = options.matchPatterns[extension]
    }

    protected override buildRegexPatterns(): { pattern: RegExp, kind: MatchKind }[] {
        return this.customPatterns.map((pattern) => {
            return {
                pattern: new RegExp(pattern),
                kind: 'regular'
            }
        })
    }
}
