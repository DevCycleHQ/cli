import { BaseParser } from './common'
import { ParseOptions } from './types'

export class CustomParser extends BaseParser {
    identity = 'custom'
    variableMethodPattern = new RegExp('')
    variableNameCapturePattern = new RegExp('')
    customPattern: string

    constructor(extension: string, options: ParseOptions) {
        super(extension, options)

        if (!options.matchPatterns || !(extension in options.matchPatterns)) {
            throw new Error(`No match pattern for ${extension}`)
        }

        this.customPattern = options.matchPatterns[extension]
    }

    override buildRegexPattern(): RegExp {
        return new RegExp(this.customPattern)
    }

    match(content: string): string | null {
        const match = this.buildRegexPattern().exec(content)
        return match ? match[1] : null
    }
}
