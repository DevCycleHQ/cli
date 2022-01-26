import { BaseParser } from '../common'

export class JavascriptParser extends BaseParser {
    identity = 'javascript'
    variableMethodPattern = /\??\.variable\(\s*/
    variableNameCapturePattern = /["']([^"']*)["']/
    defaultValueCapturePattern = /\s*,\s*([^)]*)\)/
    commentCharacters = ['//', '/*']

    match(content: string): RegExpExecArray | null {
        return this.buildRegexPattern().exec(content)
    }
}
