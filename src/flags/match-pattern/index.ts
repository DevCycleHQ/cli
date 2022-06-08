import { Flags } from '@oclif/core'
import { RepoConfigFromFile } from '../../types'

export default Flags.string({
    description: 'Additional full Regex pattern to use to match variable usages in your code.' +
        ' Should contain exactly one capture group which matches on the key of the variable. ' +
        'Must specify the file extension to override the pattern for, eg. "--match-pattern js=<YOUR PATTERN>"',
    multiple: true
})

export function getMatchPatterns(flags: Record<string, any>, config: RepoConfigFromFile | null) {
    const matchPatternsFromConfig = config?.codeInsights?.matchPatterns || {}

    return (flags['match-pattern'] || []).reduce((map: Record<string, string>, value: string) => {
        const [extension, pattern] = value.split('=')
        if (!extension || !pattern) {
            throw new Error(`Invalid match pattern: ${value}. Must be of the form "[FILE EXTENSION]=[PATTERN]`)
        }
        return { ...map, [extension]: [...(map[extension] || []), pattern] }
    }, matchPatternsFromConfig)
}