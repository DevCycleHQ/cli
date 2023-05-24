import { BaseParser } from '../BaseParser'

const userCapturePattern = /(?:\w*|{[^})]*}|new[^)]*\))/
const variableNameCapturePattern = /([^,)]*)/
const defaultValueCapturePattern = /(?:[^,)]*)/

export class CsharpParser extends BaseParser {
    identity = 'csharp'
    variableMethodPattern = /\??\.(?:(?:VariableAsync)|(?:VariableValueAsync))\(/

    orderedParameterPatterns = [
        userCapturePattern,
        variableNameCapturePattern,
        defaultValueCapturePattern
    ]

    namedParameterPatternMap = {
        user: userCapturePattern,
        key: variableNameCapturePattern,
        default: defaultValueCapturePattern
    }

    commentCharacters = ['//', '/*']
}
