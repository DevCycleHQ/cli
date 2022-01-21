import { BaseParser } from '../common'

export class GolangParser extends BaseParser {
    identity = 'golang'
    variableMethodPattern = /DevcycleApi\.Variable\([\s\w]*,[\s\w]*,\s*/
    variableNameCapturePattern = /["']([^"']*)["']/

    match(content: string): RegExpExecArray | null {
        return this.buildRegexPattern().exec(content)
    }
}
