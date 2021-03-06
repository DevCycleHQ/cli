import { BaseParser } from '../BaseParser'

const variableNameCapturePattern = /([^,)]*)/
const defaultValueCapturePattern = /(?:[^),]*|{[^}]*})/

export class JavascriptParser extends BaseParser {
    identity = 'javascript'
    variableMethodPattern = /\??\.variable\(\s*/
    orderedParameterPatterns = [
        variableNameCapturePattern,
        defaultValueCapturePattern
    ]

    commentCharacters = ['//', '/*']
}
