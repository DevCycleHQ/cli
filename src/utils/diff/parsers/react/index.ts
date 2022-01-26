import { BaseParser } from '../common'

const findVariableHookRegex = /useVariable\(\s*["']([^"']*)["']/

export class ReactParser extends BaseParser {
    identity = 'react'
    variableMethodPattern = /\??\.variable\(\s*/
    variableNameCapturePattern = /["']([^"']*)["']/
    commentCharacters = ['//', '/*', '{/*']

    match(content: string): RegExpExecArray | null {
        return this.buildRegexPattern().exec(content) ?? findVariableHookRegex.exec(content)
    }
}
