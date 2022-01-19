import { BaseParser } from '../common'

export class PhpParser extends BaseParser {
    identity = 'php'
    variableMethodPattern = /->variable\([\s\w$]*,\s*/
    variableNameCapturePattern = /["']([^"']*)["']/

    match(content: string): string | null {
        const match = this.buildRegexPattern().exec(content)
        return match ? match[1] : null
    }
}
