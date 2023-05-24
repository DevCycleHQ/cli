import { BaseParser } from '../BaseParser'

const variableNameCapturePattern = /([^,)]*)/
const defaultValueCapturePattern = /(?:[^),]*|{[^}]*})/

export class DartParser extends BaseParser {
    identity = 'dart'
    variableMethodPattern = /\??\.(?:(?:variable)|(?:variableValue))\(\s*/
    orderedParameterPatterns = [
        variableNameCapturePattern,
        defaultValueCapturePattern
    ]

    commentCharacters = ['//', '/*']
}
