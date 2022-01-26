import { BaseParser } from '../common'

export class PythonParser extends BaseParser {
    identity = 'python'
    variableMethodPattern = /\.variable\([\s\w]*,\s*/
    variableMethodKeywordPattern = /\.variable\([\s\w=,]*key\s*=\s*/
    variableNameCapturePattern = /["']([^"']*)["']/
    defaultValueCapturePattern = /\s*,\s*([^)]*)\)/
    commentCharacters = ['#', '"""']

    match(content: string): RegExpExecArray | null {
        return this.buildRegexPattern().exec(content)
    }
}
