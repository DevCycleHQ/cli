import { BaseParser } from '../common'

export class RubyParser extends BaseParser {
    identity = 'ruby'
    variableMethodPattern = /\.variable\([\s\w]*,\s*/
    variableNameCapturePattern = /["']([^"']*)["']/
    commentCharacters = ['#']

    match(content: string): RegExpExecArray | null {
        return this.buildRegexPattern().exec(content)
    }
}
