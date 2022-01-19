import { BaseParser } from '../common'

export class CsharpParser extends BaseParser {
    identity = 'csharp'
    variableMethodPattern = /\.VariableAsync\([\s\w]*,\s*/
    variableNameCapturePattern = /["']([^"']*)["']/

    match(content: string): string | null {
        const match = this.buildRegexPattern().exec(content)
        return match ? match[1] : null
    }
}
