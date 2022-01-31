import { BaseParser } from '../common'

const userCapturePattern = /(?:\$\w*|{[^})]*}|new[^)]*\)|array\([^)]*\))/
const variableNameCapturePattern = /["']([^"']*)["']/
const defaultValueCapturePattern = /(?:[^)]*)/

export class PhpParser extends BaseParser {
    identity = 'php'
    variableMethodPattern = /\??->variable\(\s*/
    orderedParameterPatterns = [
        userCapturePattern,
        variableNameCapturePattern,
        defaultValueCapturePattern
    ]
    variableParamPosition = 1

    namedParameterDelimiter = ':'
    namedParameterPatternMap = {
        key: variableNameCapturePattern,
        user: userCapturePattern,
        defaultValue: defaultValueCapturePattern
    }

    commentCharacters = ['//', '#', '/*']
}
