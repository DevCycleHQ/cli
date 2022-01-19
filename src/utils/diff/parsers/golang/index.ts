import { BaseParser } from '../common'

export class GolangParser extends BaseParser {
    identity = 'golang'
    variableMethodPattern = /DevcycleApi\.Variable\([\s\w]*,[\s\w]*,\s*/
    variableNameCapturePattern = /["']([^"']*)["']/

    match(content: string): string | null {
        const match = this.buildRegexPattern().exec(content)
        return match ? match[1] : null
    }
}
