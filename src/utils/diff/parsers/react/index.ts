import { BaseParser } from '../common'

const findVariableRegex = /dvcClient\.variable\(\s*["']([^"']*)["']/
const findVariableHookRegex = /useVariable\(\s*["']([^"']*)["']/

export class ReactParser extends BaseParser {
    identity = 'react'

    match(content: string): string | null {
        const match = findVariableRegex.exec(content) ?? findVariableHookRegex.exec(content)
        return match ? match[1] : null
    }
}
