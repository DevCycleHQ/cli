import { BaseParser } from '../common'

export class AndroidParser extends BaseParser {
    identity = 'android'
    variableMethodPattern = /\.variable\(\s*/
    variableNameCapturePattern = /["']([^"']*)["']/

    match(content: string): string | null {
        const match = this.buildRegexPattern().exec(content)
        return match ? match[1] : null
    }
}
