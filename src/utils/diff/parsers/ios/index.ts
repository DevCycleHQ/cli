import { BaseParser } from '../common'

export class IosParser extends BaseParser {
    identity = 'ios'
    variableMethodPattern = /\??\.variable\(\s*key:\s*/
    variableNameCapturePattern = /["']([^"']*)["']/
    defaultValueCapturePattern = /\s*,\s*([^)]*)\)/
    commentCharacters = ['///', '/**']

    match(content: string): RegExpExecArray | null {
        return this.buildRegexPattern().exec(content)
    }
}
