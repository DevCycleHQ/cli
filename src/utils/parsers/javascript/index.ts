import { BaseParser } from '../common'

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
