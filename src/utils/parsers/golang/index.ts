import { BaseParser } from '../BaseParser'

const authPattern = /\w*/
const userCapturePattern = /(?:\w*|[\w\s.]*{[^})]*})/
const variableNameCapturePattern = /([^,)]*)/
const defaultValueCapturePattern = /(?:[^,)]*)/

export class GolangParser extends BaseParser {
    identity = 'golang'
    variableMethodPattern = /\.DevCycleApi\.Variable\(\s*/
    orderedParameterPatterns = [
        authPattern,
        userCapturePattern,
        variableNameCapturePattern,
        defaultValueCapturePattern
    ]

    commentCharacters = ['//', '/*']

}
