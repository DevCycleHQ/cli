import { BaseParser } from '../common'

export class PhpParser extends BaseParser {
    identity = 'php'
    variableMethodPattern = /->variable\([\s\w$]*,\s*/
    variableNameCapturePattern = /["']([^"']*)["']/
    commentCharacters = ['//', '#', '/*']

    match(content: string): RegExpExecArray | null {
        return this.buildRegexPattern().exec(content)
    }
}
