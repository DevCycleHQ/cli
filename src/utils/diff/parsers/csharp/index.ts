import { BaseParser } from '../common'

export class CsharpParser extends BaseParser {
    identity = 'csharp'
    variableMethodPattern = /\.VariableAsync\([\s\w]*,\s*/
    variableNameCapturePattern = /["']([^"']*)["']/
    commentCharacters = ['//', '/*']

    match(content: string): RegExpExecArray | null {
        return this.buildRegexPattern().exec(content)
    }
}
