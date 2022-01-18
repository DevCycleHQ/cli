import { BaseParser } from '../common'

const findVariableRegex = /dvcClient\.variable\(\s*["']([^"']*)["']/

export class AndroidParser extends BaseParser {
    identity = 'android'

    match(content: string): string | null {
        const match = findVariableRegex.exec(content)
        return match ? match[1] : null
    }
}
