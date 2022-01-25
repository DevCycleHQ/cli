import { BaseParser } from '../common'

export class PythonParser extends BaseParser {
    identity = 'python'
    variableMethodPattern = /\.variable\([\s\w]*,\s*/
    variableNameCapturePattern = /["']([^"']*)["']/
    commentCharacters = ['#', '"""']

    match(content: string): RegExpExecArray | null {
        return this.buildRegexPattern().exec(content)
    }
}
