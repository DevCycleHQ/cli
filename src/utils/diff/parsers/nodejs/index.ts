import { BaseParser } from '../common'

const userCapturePattern = /(?:\w*|{[^})]*}|new[^)]*\))/
const variableNameCapturePattern = /["']([^"']*)["']/
const defaultValueCapturePattern = /(?:[^)]*)/

export class NodeParser extends BaseParser {
    identity = 'nodejs'

    variableMethodPattern = /\??\.variable\(\s*/
    orderedParameterPatterns: RegExp[] | null = [
        userCapturePattern,
        variableNameCapturePattern,
        defaultValueCapturePattern
    ]

    commentCharacters = ['//', '/*']
}
