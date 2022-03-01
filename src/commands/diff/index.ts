import { executeDiff } from '../../utils/diff/diff'
import { Flags } from '@oclif/core'
import * as emoji from 'node-emoji'
import { uniqBy } from 'lodash'
import { executeFileDiff } from '../../utils/diff/fileDiff'
import { parseFiles } from '../../utils/diff/parse'
import { VariableDiffMatch } from '../../utils/parsers/types'
import Base from '../base'
import { sha256 } from 'js-sha256'
import { fetchVariableByKey, Variable } from '../../api/variables'
import ClientNameFlag, { getClientNames } from '../../flags/client-name'
import MatchPatternFlag, { getMatchPatterns } from '../../flags/match-pattern'
import VarAliasFlag, { getVariableAliases } from '../../flags/var-alias'
import ShowRegexFlag, { showRegex } from '../../flags/show-regex'

const EMOJI = {
    add: emoji.get('large_green_circle'),
    remove: emoji.get('red_circle'),
    notice: emoji.get('warning'),
    cleanup: emoji.get('broom')
}

type MatchesByType = {
    add: Record<string, VariableDiffMatch[]>,
    remove: Record<string, VariableDiffMatch[]>,
    addUnknown: Record<string, VariableDiffMatch[]>,
    removeUnknown: Record<string, VariableDiffMatch[]>
}

type MatchEnriched = {
    variable: Variable | null,
    matches: VariableDiffMatch[]
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
        'client-name': ClientNameFlag,
        'match-pattern': MatchPatternFlag,
        'var-alias': VarAliasFlag,
        'pr-link': Flags.string({
            hidden: true,
            description: 'Link to the PR to use for formatting the line number outputs with clickable links.'
        }),
        'format': Flags.string({
            default: 'console',
            options: ['console', 'markdown'],
            description: 'Format to output the diff results in.'
        }),
        'show-regex': ShowRegexFlag
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

        const matchesBySdk = parseFiles(parsedDiff, {
            clientNames: getClientNames(flags, this.configFromFile),
            matchPatterns: getMatchPatterns(flags, this.configFromFile),
            printPatterns: showRegex(flags)
        })

        const variableAliases = getVariableAliases(flags, this.configFromFile)

        const matchesByType = this.getMatchesByType(matchesBySdk, variableAliases)

        const matchesByTypeEnriched = await this.fetchVariableData(matchesByType)

        this.formatOutput(matchesByTypeEnriched, flags['pr-link'])
    }

    private useApi() {
        return this.hasToken() && this.projectKey !== ''
    }

    private getMatchesByType(
        matchesBySdk: Record<string, VariableDiffMatch[]>,
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
            matches: Record<string, VariableDiffMatch[]>,
            category: 'add' | 'remove'
        ) => {
            const keys = Object.keys(matches)
            const variablesByKey: Record<string, Variable | null> = {}

            if (this.useApi()) {
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
                if (!variablesByKey[key] && this.useApi()) {
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

        const subHeaderPrefix = this.useMarkdown ? '### ' : ''

        if (this.useMarkdown) {
            const lightTogglebot = 'togglebot.svg#gh-light-mode-only'
            const darkTogglebot = 'togglebot-white.svg#gh-dark-mode-only'
            const buildIcon = (icon: string) => (
                `<img src="https://github.com/DevCycleHQ/cli/raw/main/assets/${icon}" height="31px" align="center"/>`
            )
            this.log(
                `\n## ${buildIcon(lightTogglebot)}${buildIcon(darkTogglebot)}` +
                ' DevCycle Variable Changes:\n'
            )
        } else {
            this.log('\nDevCycle Variable Changes:\n')
        }
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

    private logLocations(matches: VariableDiffMatch[], mode: 'add' | 'remove', prLink?: string) {
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
