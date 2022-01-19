import { BaseParser } from '../common'

const findVariableHookRegex = /useVariable\(\s*["']([^"']*)["']/

export class ReactParser extends BaseParser {
    identity = 'react'
    variableMethodPattern = /\.variable\(\s*/
    variableNameCapturePattern = /["']([^"']*)["']/

    match(content: string): string | null {
        const match = this.buildRegexPattern().exec(content) ?? findVariableHookRegex.exec(content)
        return match ? match[1] : null
    }
}
