import { BaseParser } from '../common'

const findVariableRegex = /DevcycleApi\.Variable\([\s\w]*,[\s\w]*,\s*["']([^"']*)["']/

export class GolangParser extends BaseParser {
    identity = 'golang'

    match(content: string): string | null {
        const match = findVariableRegex.exec(content)
        return match ? match[1] : null
    }
}
