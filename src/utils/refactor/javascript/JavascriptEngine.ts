import * as babelParser from '@babel/parser'
import { RefactorEngine } from '../RefactorEngine'

export class JavascriptEngine extends RefactorEngine {
    sdkMethods: RefactorEngine['sdkMethods'] = {
        variable: 'variable',
        useVariable: 'variable',
        useDVCVariable: 'variable',
        useVariableValue: 'variable.value',
    }

    parser: RefactorEngine['parser'] = {
        parse(source: any) {
            return babelParser.parse(source, {
                sourceType: 'module',
                plugins: ['jsx', 'typescript', 'decorators-legacy'],
                tokens: true
            })
        }
    }
}