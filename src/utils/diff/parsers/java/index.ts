import { BaseParser } from '../common'

const findVariableRegex = /dvcClient\.variable\([\s\w]*,\s*["']([^"']*)["']/

export class JavaParser extends BaseParser {
    identity = 'java'

    match(content: string): string | null {
        const match = findVariableRegex.exec(content)
        return match ? match[1] : null
    }
}
