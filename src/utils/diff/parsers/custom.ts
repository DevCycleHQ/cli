import { BaseParser } from './common'
import { ParseOptions } from './types'

export class CustomParser extends BaseParser {
    identity = 'custom'
    variableMethodPattern = new RegExp('')
    variableNameCapturePattern = new RegExp('')
    defaultValueCapturePattern = new RegExp('')
    customPatterns: string[]

    constructor(extension: string, options: ParseOptions) {
        super(extension, options)

        if (!options.matchPatterns || !(extension in options.matchPatterns)) {
            throw new Error(`No match pattern for ${extension}`)
        }

        this.customPatterns = options.matchPatterns[extension]
    }

    match(content: string): RegExpExecArray | null {
        for (const pattern of this.customPatterns) {
            const match = (new RegExp(pattern)).exec(content)
            if (match) return match
        }

        return null
    }
}
