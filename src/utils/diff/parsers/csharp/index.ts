import { BaseParser } from '../common'

const userCapturePattern = /(?:\w*|{[^})]*}|new[^)]*\))/
const variableNameCapturePattern = /["']([^"']*)["']/
const defaultValueCapturePattern = /(?:[^)]*)/

export class CsharpParser extends BaseParser {
    identity = 'csharp'
    variableMethodPattern = /\??\.VariableAsync\(/

    orderedParameterPatterns = [
        userCapturePattern,
        variableNameCapturePattern,
        defaultValueCapturePattern
    ]

    variableParamPosition = 1

    namedParameterPatternMap = {
        user: userCapturePattern,
        key: variableNameCapturePattern,
        default: defaultValueCapturePattern
    }

    commentCharacters = ['//', '/*']
}
