import { BaseParser } from '../BaseParser'

const variableNameCapturePattern = /([^,)]*)/
const defaultValueCapturePattern = /(?:[^),]*|{[^}]*})/

export class JavascriptParser extends BaseParser {
    identity = 'javascript'
    variableMethodPattern = /\??\.(?:(?:variable)|(?:variableValue))\(\s*/
    orderedParameterPatterns = [
        variableNameCapturePattern,
        defaultValueCapturePattern
    ]

    commentCharacters = ['//', '/*']
}
