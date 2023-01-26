import { BaseParser } from '../BaseParser'

const userCapturePattern = /(?:\w*|[\w\s.]*{[^})]*})/
const variableNameCapturePattern = /([^,)]*)/
const defaultValueCapturePattern = /(?:[^,)]*)/

export class GolangParser extends BaseParser {
    identity = 'golang'
    variableMethodPattern = /\.Variable\(\s*/
    orderedParameterPatterns = [
        userCapturePattern,
        variableNameCapturePattern,
        defaultValueCapturePattern
    ]

    commentCharacters = ['//', '/*']

}
