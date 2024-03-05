import { Flags } from '@oclif/core'
import { RepoConfigFromFile } from '../../types'

export default Flags.string({
    description:
        'Aliases to use when identifying variables in your code.' +
        ' Should contain a code reference mapped to a DevCycle variable key,' +
        ' eg. "--var-alias "VARIABLES.ENABLE_V1=enable-v1"',
    multiple: true,
})

export function getVariableAliases(
    flags: Record<string, any>,
    config: RepoConfigFromFile | null,
) {
    const variableAliasesFromConfig =
        config?.codeInsights?.variableAliases || {}

    return (flags['var-alias'] || []).reduce(
        (map: Record<string, string>, value: string) => {
            const [codeRef, variableName] = value.trim().split('=')
            if (!codeRef || !variableName) {
                throw new Error(
                    `Invalid variable alias: ${value}. Must be of the form "[CODE REF]=[VARIABLE KEY]`,
                )
            }
            return { ...map, [codeRef]: variableName }
        },
        variableAliasesFromConfig,
    )
}
