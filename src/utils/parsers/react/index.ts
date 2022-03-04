import { BaseParser } from '../BaseParser'

const variableNameCapturePattern = /([^,)]*)/
const defaultValueCapturePattern = /(?:[^),]*|{[^}]*})/

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
