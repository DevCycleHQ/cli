import { BaseParser } from '../common'

export class IosParser extends BaseParser {
    identity = 'ios'
    variableMethodPattern = /\.variable\(\s*key:\s*/
    variableNameCapturePattern = /["']([^"']*)["']/

    match(content: string): string | null {
        const match = this.buildRegexPattern().exec(content)
        return match ? match[1] : null
    }
}
