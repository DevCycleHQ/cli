import { getVariableAliasesFromTypeGeneratorFile } from './index'
import { expect } from '@oclif/test'
import chai from 'chai'

const unobfuscatedFile = `
/**
    some comment
*/
export const enabledFeature = 'enabled-feature' as const
/**
    some comment
*/
export const disabledFeature = 'disabled-feature' as const

export const useVariableValue = () => {}
`

const obfuscatedFile = `
/**
    key: enabled-feature
    some comment
*/
export const enabledFeature = 'dvc_obfs_iuhrwgiuwgiuasdasdasd' as const
/**
    key: disabled-feature
    some comment
*/
export const disabledFeature = 'dvc_obfs_iuhrwgiuwgiuasdasdasd' as const
`

const unparseableObfuscated = `
/**
    key: enabled-feature
    some comment
*/
export const enabledFeature = 'dvc_obfs_iuhrwgiuwgiuasdasdasd' as const
/**
    some comment
*/
export const disabledFeature = 'dvc_obfs_iuhrwgiuwgiuasdasdasd' as const
`

describe('var-alias', () => {
    describe('getVariableAliasesFromTypeGeneratorFile', () => {
        it('should correctly parse out aliases for non-obfuscated variables', () => {
            const variableAliases: Record<string, string> = {}
            getVariableAliasesFromTypeGeneratorFile(
                unobfuscatedFile,
                variableAliases,
            )
            expect(variableAliases).to.deep.equal({
                enabledFeature: 'enabled-feature',
                disabledFeature: 'disabled-feature',
            })
        })
        it('should correctly parse out aliases for obfuscated variables', () => {
            const variableAliases: Record<string, string> = {}
            getVariableAliasesFromTypeGeneratorFile(
                obfuscatedFile,
                variableAliases,
            )
            expect(variableAliases).to.deep.equal({
                enabledFeature: 'enabled-feature',
                disabledFeature: 'disabled-feature',
            })
        })
        it('it should throw if the obfuscated variable key cannot be found', () => {
            const variableAliases: Record<string, string> = {}
            expect(() =>
                getVariableAliasesFromTypeGeneratorFile(
                    unparseableObfuscated,
                    variableAliases,
                ),
            ).to.throw(
                'Could not find key for obfuscated variable disabledFeature',
            )
        })
    })
})
