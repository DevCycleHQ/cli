import { BaseParser } from '../common'

const findVariableRegex = /dvcClient\.VariableAsync\([\s\w]*,\s*["']([^"']*)["']/

export class CsharpParser extends BaseParser {
    identity = 'csharp'

    match(content: string): string | null {
        const match = findVariableRegex.exec(content)
        return match ? match[1] : null
    }
}
