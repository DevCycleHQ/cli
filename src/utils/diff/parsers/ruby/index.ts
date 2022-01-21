import { BaseParser } from '../common'

export class RubyParser extends BaseParser {
    identity = 'ruby'
    variableMethodPattern = /\.variable\([\s\w]*,\s*/
    variableNameCapturePattern = /["']([^"']*)["']/

    match(content: string): RegExpExecArray | null {
        return this.buildRegexPattern().exec(content)
    }
}
