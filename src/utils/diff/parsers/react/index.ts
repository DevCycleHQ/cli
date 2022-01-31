import { BaseParser } from '../common'

const variableNameCapturePattern = /["']([^"']*)["']/
const defaultValueCapturePattern = /(?:[^)]*)/

export class ReactParser extends BaseParser {
    identity = 'react'
    matchClientName = false
    variableMethodPattern = /useVariable\(\s*/
    orderedParameterPatterns = [
        variableNameCapturePattern,
        defaultValueCapturePattern
    ]

    commentCharacters = ['//', '/*', '{/*']
}
