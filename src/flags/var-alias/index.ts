import { Flags } from '@oclif/core'
import { RepoConfigFromFile } from '../../types'
import fs from 'fs'

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
    const variableAliases: Record<string, string> = {}
    const typesFileLocation = config?.typeGenerator?.fileLocation

    if (typesFileLocation) {
        // load types file and iterate each line
        // if line matches a variable alias, add to variableAliasesFromConfig
        const lines = fs.readFileSync(typesFileLocation, 'utf8').split('\n')
        lines.forEach((line, index) => {
            if (
                line.startsWith('export const') &&
                !line.includes('useVariable')
            ) {
                const [_, assignment] = line.split('export const')
                const [constant, keyAndExtras] = assignment.split('=')
                let key = keyAndExtras.match(/'([^']+)'/)?.[1]

                if (key?.startsWith('dvc_obfs')) {
                    const commentLines = lines
                        .slice(index - 20, index)
                        .reverse()
                    let foundKey = false
                    for (const commentLine of commentLines) {
                        if (commentLine.trim().startsWith('/**')) {
                            break
                        }
                        if (commentLine.trim().startsWith('* key:')) {
                            key = commentLine.split(': ')[1]
                            foundKey = true
                            break
                        }
                    }
                    if (!foundKey) {
                        throw new Error(
                            `Could not find key for obfuscated variable ${constant}`,
                        )
                    }
                }

                if (key) {
                    variableAliases[constant.trim()] = key.trim()
                }
            }
        })

        console.log('ALIASES', variableAliases)
    }

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
        variableAliases,
    )
}
