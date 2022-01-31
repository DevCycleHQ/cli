import { BaseParser } from '../common'

const variableNameCapturePattern = /["']([^"']*)["']/
const defaultValueCapturePattern = /(?:[^)]*)/

export class AndroidParser extends BaseParser {
    identity = 'android'
    variableMethodPattern = /\??\.variable\(/

    orderedParameterPatterns = [
        variableNameCapturePattern,
        defaultValueCapturePattern
    ]

    variableParamPosition = 0

    namedParameterDelimiter = '='
    namedParameterPatternMap = {
        key: variableNameCapturePattern,
        default: defaultValueCapturePattern
    }

    commentCharacters = ['//', '/**', '*', '<!--']
}
