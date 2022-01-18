import { BaseParser } from '../common'

const findVariableRegex = /dvcClient\.variable\(\s*key:\s*["']([^"']*)["']/

export class IosParser extends BaseParser {
    identity = 'ios'

    match(content: string): string | null {
        const match = findVariableRegex.exec(content)
        return match ? match[1] : null
    }
}
