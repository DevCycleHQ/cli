import { BaseParser } from '../common'

export class ReactParser extends BaseParser {
    identity = 'react'
    matchClientName = false
    variableMethodPattern = /useVariable\(\s*/
    variableNameCapturePattern = /["']([^"']*)["']/
    defaultValueCapturePattern = /\s*,\s*([^)]*)\)/
    commentCharacters = ['//', '/*', '{/*']

    match(content: string): RegExpExecArray | null {
        return this.buildRegexPattern().exec(content)
    }
}
