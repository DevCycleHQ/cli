import { BaseParser } from '../BaseParser'

const variableNameCapturePattern = /([^,)=]*)/
const defaultValueCapturePattern = /(?:[^),]*|new[^)]*\))/

export class AndroidParser extends BaseParser {
    identity = 'android'
    variableMethodPattern = /\??\.variable\(/

    orderedParameterPatterns = [
        variableNameCapturePattern,
        defaultValueCapturePattern
    ]

    namedParameterDelimiter = '='
    namedParameterPatternMap = {
        key: variableNameCapturePattern,
        default: defaultValueCapturePattern
    }

    commentCharacters = ['//', '/**', '*', '<!--']
}
