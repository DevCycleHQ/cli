import { BaseParser } from '../common'

export class NodeParser extends BaseParser {
    identity = 'nodejs'
    variableMethodPattern = /\.variable\([\s\w]*,\s*/
    variableNameCapturePattern = /["']([^"']*)["']/

    match(content: string): RegExpExecArray | null {
        return this.buildRegexPattern().exec(content)
    }
}
