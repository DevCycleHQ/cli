import { BaseParser } from '../common'

const userCapturePattern = /(?:\w*|{[^})]*}|new[^)]*\))/
const variableNameCapturePattern = /["']([^"']*)["']/
const defaultValueCapturePattern = /(?:[^)]*)/

export class JavaParser extends BaseParser {
    identity = 'java'
    variableMethodPattern = /\.variable\(\s*/
    orderedParameterPatterns = [
        userCapturePattern,
        variableNameCapturePattern,
        defaultValueCapturePattern
    ]
    variableParamPosition = 1

    commentCharacters = ['/**', '*']
}
