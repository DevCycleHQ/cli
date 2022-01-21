import { BaseParser } from '../common'

export class CsharpParser extends BaseParser {
    identity = 'csharp'
    variableMethodPattern = /\.VariableAsync\([\s\w]*,\s*/
    variableNameCapturePattern = /["']([^"']*)["']/

    match(content: string): RegExpExecArray | null {
        return this.buildRegexPattern().exec(content)
    }
}
