import { BaseParser } from '../common'

export class PhpParser extends BaseParser {
    identity = 'php'
    variableMethodPattern = /\??->variable\([\s\w$]*,\s*/
    variableMethodKeywordPattern = /\??->variable\([\s\w$:,]*key\s*:\s*/
    variableNameCapturePattern = /["']([^"']*)["']/
    defaultValueCapturePattern = /\s*,\s*([^)]*)\)/
    commentCharacters = ['//', '#', '/*']

    match(content: string): RegExpExecArray | null {
        return this.buildRegexPattern().exec(content)
    }
}
