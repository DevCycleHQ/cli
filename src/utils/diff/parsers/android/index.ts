import { BaseParser } from '../common'

export class AndroidParser extends BaseParser {
    identity = 'android'
    variableMethodPattern = /\.variable\(\s*/
    variableNameCapturePattern = /["']([^"']*)["']/
    commentCharacters = ['//', '/**', '*', '<!--']

    match(content: string): RegExpExecArray | null {
        return this.buildRegexPattern().exec(content)
    }
}
