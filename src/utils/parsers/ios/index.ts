import { BaseParser } from '../BaseParser'

const variableNameCapturePattern = /([^,)]*)/
const defaultValueCapturePattern = /(?:[^,)]*)/

export class IosParser extends BaseParser {
    identity = 'ios'
    variableMethodPattern = /\??\.variable\(/

    namedParameterDelimiter = ':'
    namedParameterPatternMap = {
        key: variableNameCapturePattern,
        defaultValue: defaultValueCapturePattern
    }

    commentCharacters = ['///', '/**']
    
}
