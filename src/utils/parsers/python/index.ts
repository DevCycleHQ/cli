import { BaseParser } from '../BaseParser'

const userCapturePattern = /(?:\w*|{[^})]*}|\w*\([^)]*\))/
const variableNameCapturePattern = /([^,)]*)/
const defaultValueCapturePattern = /(?:[^,)]*)/

export class PythonParser extends BaseParser {
    identity = 'python'
    variableMethodPattern = /\.(variable|variable_value)\(\s*/

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
