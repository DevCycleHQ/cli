import { BaseParser } from '../common'

export class JavaParser extends BaseParser {
    identity = 'java'
    variableMethodPattern = /\.variable\([\s\w]*,\s*/
    variableNameCapturePattern = /["']([^"']*)["']/
    defaultValueCapturePattern = /\s*,\s*([^)]*)\)/
    commentCharacters = ['/**', '*']

    match(content: string): RegExpExecArray | null {
        return this.buildRegexPattern().exec(content)
    }
}
