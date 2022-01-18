import { BaseParser } from '../common'

const findVariableRegex = /dvcClient->variable\([\s\w$]*,\s*["']([^"']*)["']/

export class PhpParser extends BaseParser {
    identity = 'php'

    match(content: string): string | null {
        const match = findVariableRegex.exec(content)
        return match ? match[1] : null
    }
}
