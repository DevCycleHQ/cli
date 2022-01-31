import { BaseParser } from '../common'

const userCapturePattern = /(?:[\s\w]*|{[^})]*}|[\w.:]*new\({[^)}]*}\))/
const variableNameCapturePattern = /["']([^"']*)["']/
const defaultValueCapturePattern = /(?:[^)]*)/

export class RubyParser extends BaseParser {
    identity = 'ruby'
    variableMethodPattern = /&?\.variable\(\s*/
    orderedParameterPatterns = [
        userCapturePattern,
        variableNameCapturePattern,
        defaultValueCapturePattern
    ]

    commentCharacters = ['#']
}
