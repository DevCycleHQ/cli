import { BaseParser } from '../common'

const userCapturePattern = /(?:\w*|{[^})]*}|\w*\([^)]*\))/
const variableNameCapturePattern = /([^,)]*)/
const defaultValueCapturePattern = /(?:[^,)]*)/

export class PythonParser extends BaseParser {
    identity = 'python'
    variableMethodPattern = /\.variable\(\s*/

    orderedParameterPatterns = [
        userCapturePattern,
        variableNameCapturePattern,
        defaultValueCapturePattern
    ]

    namedParameterDelimiter = '='
    namedParameterPatternMap = {
        key: variableNameCapturePattern,
        user: userCapturePattern,
        defaultValue: defaultValueCapturePattern
    }

    commentCharacters = ['#', '"""']
}
