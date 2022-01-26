import { BaseParser } from '../common'

export class NodeParser extends BaseParser {
    identity = 'nodejs'
    variableMethodPattern = /\??\.variable\([\s\w]*,\s*/
    variableNameCapturePattern = /["']([^"']*)["']/
    defaultValueCapturePattern = /\s*,\s*([^)]*)\)/
    commentCharacters = ['//', '/*']

    match(content: string): RegExpExecArray | null {
        return this.buildRegexPattern().exec(content)
    }
}
