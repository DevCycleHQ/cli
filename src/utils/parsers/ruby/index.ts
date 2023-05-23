import { BaseParser } from '../BaseParser'

const userCapturePattern = /(?:[\s\w]*|{[^})]*}|[\w.:]*new\({[^)}]*}\))/
const variableNameCapturePattern = /([^,)]*)/
const defaultValueCapturePattern = /(?:[^,)]*)/

export class RubyParser extends BaseParser {
    identity = 'ruby'
    variableMethodPattern = /&?\.(variable|variable_value)\(\s*/
    orderedParameterPatterns = [
        userCapturePattern,
        variableNameCapturePattern,
        defaultValueCapturePattern
    ]

    commentCharacters = ['#']
}
