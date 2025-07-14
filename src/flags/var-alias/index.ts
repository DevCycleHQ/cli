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
    const variableAliases: Record<string, string> =
        config?.codeInsights?.variableAliases ?? {}
    const typesFileLocation = config?.typeGenerator?.outputPath

    if (typesFileLocation) {
        addAliasesFromTypeGenerator(typesFileLocation, variableAliases)
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

export const addAliasesFromTypeGenerator = (
    typesFileLocation: string,
    variableAliases: Record<string, string>,
) => {
    if (fs.existsSync(typesFileLocation)) {
        const file = fs.readFileSync(typesFileLocation, 'utf8')
        getVariableAliasesFromTypeGeneratorFile(file, variableAliases)
    }
}

export const getVariableAliasesFromTypeGeneratorFile = (
    file: string,
    variableAliases: Record<string, string>,
) => {
    // load types file and iterate each line
    // if line matches a variable alias, add to variableAliasesFromConfig
    const lines = file.split('\n')
    lines.forEach((line, index) => {
        if (line.startsWith('export const') && !line.includes('useVariable')) {
            const [, assignment] = line.split('export const')
            const [constant, keyAndExtras] = assignment.split('=')
            let key = keyAndExtras.match(/'([^']+)'/)?.[1]

            if (key?.startsWith('dvc_obfs')) {
                const commentLines = lines.slice(index - 20, index).reverse()
                let foundKey = false
                for (const commentLine of commentLines) {
                    if (commentLine.trim().startsWith('/**')) {
                        break
                    }
                    if (commentLine.trim().startsWith('key:')) {
                        key = commentLine.split(': ')[1]
                        foundKey = true
                        break
                    }
                }
                if (!foundKey) {
                    throw new Error(
                        `Could not find key for obfuscated variable ${constant.trim()}`,
                    )
                }
            }

            if (key) {
                variableAliases[constant.trim()] = key.trim()
            }
        }
    })
}
