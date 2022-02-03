import { executeDiff } from '../../utils/diff/diff'
import { Flags } from '@oclif/core'
import * as emoji from 'node-emoji'
import { uniqBy } from 'lodash'
import { executeFileDiff } from '../../utils/diff/fileDiff'
import { parseFiles } from '../../utils/diff/parse'
import { VariableMatch } from '../../utils/diff/parsers/types'
import Base from '../base'
import { sha256 } from 'js-sha256'
import { fetchVariableByKey } from '../../api/variables'
import { Variable } from '../../types/variable'

const EMOJI = {
    add: emoji.get('large_green_circle'),
    remove: emoji.get('red_circle'),
    notice: emoji.get('warning'),
    cleanup: emoji.get('broom')
}

type MatchesByType = {
    add: Record<string, VariableMatch[]>,
    remove: Record<string, VariableMatch[]>,
    addUnknown: Record<string, VariableMatch[]>,
    removeUnknown: Record<string, VariableMatch[]>

}

type MatchEnriched = {
    variable: Variable | null,
    matches: VariableMatch[]
}

type MatchesByTypeEnriched = {
    add: Record<string, MatchEnriched>
    remove: Record<string, MatchEnriched>,
    notFoundAdd: Record<string, MatchEnriched>,
    notFoundRemove: Record<string, MatchEnriched>,
    addUnknown: Record<string, MatchEnriched>,
    removeUnknown: Record<string, MatchEnriched>
}

export default class Diff extends Base {
    static hidden = false
    authSuggested = true

    static description = 'Print a diff of DevCycle variable usage between two versions of your code.'
    static examples = [
        '<%= config.bin %> <%= command.id %>',
        '<%= config.bin %> <%= command.id %> ' +
        '--match-pattern javascript="dvcClient\\.variable\\(\\s*["\']([^"\']*)["\']"',
    ]

    static flags = {
        ...Base.flags,
        file: Flags.string({ char: 'f', description: 'File path of existing diff file to inspect.' }),
        'client-name': Flags.string({
            description: 'Name(s) of the DevCycle client variable to match on. Accepts multiple values.', multiple: true
        }),
        'match-pattern': Flags.string({
            description: 'Additional full Regex pattern to use to match variable usages in your code.' +
                ' Should contain exactly one capture group which matches on the key of the variable. ' +
                'Must specify the file extension to override the pattern for, eg. "--match-pattern js=<YOUR PATTERN>"',
            multiple: true
        }),
        'var-alias': Flags.string({
            description: 'Aliases to use when identifying variables in your code.' +
            ' Should contain a code reference mapped to a DevCycle variable key,' +
            ' eg. "--var-alias "VARIABLES.ENABLE_V1=enable-v1"',
            multiple: true
        }),
        'pr-link': Flags.string({
            hidden: true,
            description: 'Link to the PR to use for formatting the line number outputs with clickable links.'
        }),
        'format': Flags.string({
            default: 'console',
            options: ['console', 'markdown'],
            description: 'Format to output the diff results in.'
        })
    }

    static args = [
        { name: 'diff-pattern', description: 'A "git diff"-compatible diff pattern, eg. "branch1 branch2"' },
    ]

    useMarkdown = false

    public async run(): Promise<void> {
        const { args, flags } = await this.parse(Diff)

        if (!flags.file && !args['diff-pattern']) {
            throw new Error('Must provide a diff pattern')
        }

        this.useMarkdown = flags.format === 'markdown'

        const parsedDiff = flags.file ? executeFileDiff(flags.file) : executeDiff(args['diff-pattern'])

        const codeInsightsConfig = this.configFromFile?.codeInsights || {}

        const matchPatternsFromConfig: Record<string, string[]> = codeInsightsConfig.matchPatterns || {}
        const clientNamesFromConfig = codeInsightsConfig.clientNames || []
        const variableAliasesFromConfig = codeInsightsConfig.variableAliases || {}

        const matchPatterns = (flags['match-pattern'] || []).reduce((acc, value) => {
            const [extension, pattern] = value.split('=')
            if (!extension || !pattern) {
                throw new Error(`Invalid match pattern: ${value}. Must be of the form "[FILE EXTENSION]=[PATTERN]`)
            }
            return { ...acc, [extension]: [...(acc[extension] || []), pattern] }
        }, matchPatternsFromConfig)

        const matchesBySdk = parseFiles(parsedDiff, {
            clientNames: [...clientNamesFromConfig, ...(flags['client-name'] || [])],
            matchPatterns
        })

        const variableAliases = (flags['var-alias'] || []).reduce((map, value) => {
            const [codeRef, variableName] = value.trim().split('=')
            if (!codeRef || !variableName) {
                throw new Error(`Invalid variable alias: ${value}. Must be of the form "[CODE REF]=[VARIABLE KEY]`)
            }
            return { ...map, [codeRef]: variableName }
        }, variableAliasesFromConfig)

        const matchesByType = this.getMatchesByType(matchesBySdk, variableAliases)

        const matchesByTypeEnriched = await this.fetchVariableData(matchesByType)

        this.formatOutput(matchesByTypeEnriched, flags['pr-link'])
    }

    private useApi() {
        return this.token && this.projectKey
    }

    private getMatchesByType(
        matchesBySdk: Record<string, VariableMatch[]>,
        aliasMap: Record<string, string>
    ): MatchesByType {
        const matchesByType: MatchesByType = {
            add: {},
            remove: {},
            addUnknown: {},
            removeUnknown: {}
        }
        Object.values(matchesBySdk).forEach((matches) => {
            matches.forEach((m) => {
                const match = { ...m }
                const aliasedName = aliasMap[match.name]
                if (match.isUnknown && aliasedName) {
                    match.alias = match.name
                    match.name = aliasedName
                    delete match.isUnknown
                }
                const mode: keyof MatchesByType = `${match.mode}${match.isUnknown ? 'Unknown' : ''}`
                matchesByType[mode] ??= {}
                matchesByType[mode][match.name] ??= []
                matchesByType[mode][match.name].push(match)
                matchesByType[mode][match.name] = uniqBy(
                    matchesByType[mode][match.name],
                    (m) => `${m.fileName}:${m.line}`
                )
            })
        })
        return matchesByType
    }

    private async fetchVariableData(matchesByType: MatchesByType): Promise<MatchesByTypeEnriched> {
        const categories: MatchesByTypeEnriched = {
            add: {},
            remove: {},
            notFoundAdd: {},
            notFoundRemove: {},
            addUnknown: {},
            removeUnknown: {}
        }

        const fetchAndCategorize = async (
            matches: Record<string, VariableMatch[]>,
            category: 'add' | 'remove'
        ) => {
            const keys = Object.keys(matches)
            const variablesByKey: Record<string, Variable | null> = {}
            let useApi = false

            if (this.token && this.projectKey) {
                useApi = true
                const token = this.token
                const projectKey = this.projectKey
                await Promise.all(keys.map(async (key: string) => {
                    variablesByKey[key] = await fetchVariableByKey(token, projectKey, key)
                }))
            }

            for (const key of Object.keys(matches)) {
                categories[category][key] = {
                    variable: variablesByKey[key],
                    matches: matches[key]
                }
                if (!variablesByKey[key] && useApi) {
                    categories[category === 'add' ? 'notFoundAdd' : 'notFoundRemove'][key] = {
                        variable: null,
                        matches: matches[key]
                    }
                }
            }
        }

        await Promise.all([
            fetchAndCategorize(matchesByType.add, 'add'),
            fetchAndCategorize(matchesByType.remove, 'remove')
        ])

        const enrichedAddUnknown: Record<string, MatchEnriched> = {}
        const enrichedRemoveUnknown: Record<string, MatchEnriched> = {}

        for (const [key, matches] of Object.entries(matchesByType.addUnknown)) {
            enrichedAddUnknown[key] = {
                variable: null,
                matches
            }
        }

        for (const [key, matches] of Object.entries(matchesByType.removeUnknown)) {
            enrichedRemoveUnknown[key] = {
                variable: null,
                matches
            }
        }

        categories.addUnknown = enrichedAddUnknown
        categories.removeUnknown = enrichedRemoveUnknown

        return categories
    }

    private formatOutput(matchesByTypeEnriched: MatchesByTypeEnriched, prLink?: string) {

        const additions = { ...matchesByTypeEnriched.add, ...matchesByTypeEnriched.addUnknown }
        const deletions = { ...matchesByTypeEnriched.remove, ...matchesByTypeEnriched.removeUnknown }
        const totalAdditions = Object.keys(additions).length
        const totalDeletions = Object.keys(deletions).length
        const totalNotices = Object.keys(matchesByTypeEnriched.notFoundAdd).length
            + Object.keys(matchesByTypeEnriched.addUnknown).length
            + Object.keys(matchesByTypeEnriched.removeUnknown).length
        const totalCleanup = Object.keys(matchesByTypeEnriched.notFoundRemove).length

        const headerPrefix = this.useMarkdown ? '## ' : ''
        const subHeaderPrefix = this.useMarkdown ? '### ' : ''

        this.log(`\n${headerPrefix}DevCycle Variable Changes:\n`)
        if (totalNotices) {
            this.log(`${EMOJI.notice}   ${totalNotices} Variable${totalNotices === 1 ? '' : 's'} With Notices`)
        }
        this.log(`${EMOJI.add}  ${totalAdditions} Variable${totalAdditions === 1 ? '' : 's'} Added`)
        this.log(`${EMOJI.remove}  ${totalDeletions} Variable${totalDeletions === 1 ? '' : 's'} Removed`)
        if (totalCleanup) {
            this.log(`${EMOJI.cleanup}  ${totalCleanup} Variable${totalCleanup === 1 ? '' : 's'} Cleaned up`)
        }

        if (totalNotices) {
            this.log(`\n${subHeaderPrefix}${EMOJI.notice}  Notices\n`)
            this.logNotices(matchesByTypeEnriched)
        }

        if (totalAdditions) {
            this.log(`\n${subHeaderPrefix}${EMOJI.add} Added\n`)
            this.logMatches(additions, 'add', prLink)
        }

        if (totalDeletions) {
            this.log(`\n${subHeaderPrefix}${EMOJI.remove} Removed\n`)
            this.logMatches(deletions, 'remove', prLink)
        }

        if (totalCleanup) {
            this.log(`\n${subHeaderPrefix}${EMOJI.cleanup} Cleaned Up\n`)
            this.log('The following variables that do not exist in DevCycle were cleaned up:\n')
            this.logCleanup(matchesByTypeEnriched)
        }
    }

    private logNotices(
        matchesByTypeEnriched: MatchesByTypeEnriched
    ) {
        let offset = 0
        Object.entries(matchesByTypeEnriched.notFoundAdd).forEach(([variableName], idx) => {
            this.log(`  ${idx + 1}. Variable "${variableName}" does not exist on DevCycle`)
            offset = idx + 1
        })

        Object.entries({ ...matchesByTypeEnriched.addUnknown, ...matchesByTypeEnriched.removeUnknown })
            .forEach(([variableName], idx) => {
                this.log(`  ${offset + idx + 1}. Variable "${
                    variableName}" could not be identified. Try adding an alias.`)
            })
    }

    private logCleanup(
        matchesByTypeEnriched: MatchesByTypeEnriched
    ) {
        Object.entries(matchesByTypeEnriched.notFoundRemove).forEach(([variableName], idx) => {
            this.log(`  ${idx + 1}. ${variableName}`)
        })
    }

    private logMatches(
        matchesByVariable: Record<string, MatchEnriched>,
        mode: 'add' | 'remove',
        prLink?: string
    ) {
        Object.entries(matchesByVariable).forEach(([variableName, enriched], idx) => {
            const matches = enriched.matches
            const notFound = this.useApi() && !enriched.variable
            const isUnknown = enriched.matches.some((match) => match.isUnknown)
            const hasNotice = (mode === 'add' && (notFound || isUnknown)) || mode === 'remove' && isUnknown
            const hasCleanup = mode === 'remove' && notFound

            const formattedName = this.useMarkdown ? `**${variableName}**` : variableName

            this.log(`  ${idx + 1}. ${formattedName}${
                hasNotice ? ` ${EMOJI.notice}` : ''}${
                hasCleanup ? ` ${EMOJI.cleanup}` : ''}`)

            if (enriched.variable?.type) {
                this.log(`\t   Type: ${enriched.variable.type}`)
            }

            this.logLocations(matches, mode, prLink)
        })
    }

    private logLocations(matches: VariableMatch[], mode: 'add' | 'remove', prLink?: string) {
        const formatPrLink = (fileName: string, line: number) => {
            return `[${fileName}:L${line}](${
                prLink}/files#diff-${sha256(fileName)}${mode === 'add' ? 'R' : 'L'}${line})`
        }

        matches.sort((a, b) => {
            if (a.fileName === b.fileName) return a.line > b.line ? 1 : -1
            return a.fileName > b.fileName ? 1 : -1
        })

        if (matches.length === 1) {
            const { fileName, line } = matches[0]
            if (prLink) {
                this.log(`\t   Location: ${formatPrLink(fileName, line)}`)
            } else {
                this.log(`\t   Location: ${fileName}:L${line}`)
            }
        } else {
            this.log('\t   Locations:')
            matches.forEach(({ fileName, line }) => {
                if (prLink) {
                    this.log(`\t    - ${formatPrLink(fileName, line)}`)
                } else {
                    this.log(`\t    - ${fileName}:L${line}`)
                }
            })
        }
    }
}
