import { executeDiff } from '../../utils/diff/diff'
import { Flags, Args } from '@oclif/core'
import { uniqBy } from 'lodash'
import { executeFileDiff } from '../../utils/diff/fileDiff'
import { parseFiles } from '../../utils/diff/parse'
import { VariableDiffMatch } from '../../utils/parsers/types'
import Base from '../base'
import { sha256 } from 'js-sha256'
import { createHash } from 'node:crypto'
import { fetchVariableByKey } from '../../api/variables'
import ClientNameFlag, { getClientNames } from '../../flags/client-name'
import MatchPatternFlag, { getMatchPatterns } from '../../flags/match-pattern'
import VarAliasFlag, { getVariableAliases } from '../../flags/var-alias'
import ShowRegexFlag, { showRegex } from '../../flags/show-regex'
import { Variable } from '../../api/schemas'
import { FileFilters } from '../../utils/FileFilters'

const EMOJI = {
    add: '🟢',
    remove: '🔴',
    notice: '⚠️',
    cleanup: '🧹',
}

type MatchesByType = {
    add: Record<string, VariableDiffMatch[]>
    remove: Record<string, VariableDiffMatch[]>
    addUnknown: Record<string, VariableDiffMatch[]>
    removeUnknown: Record<string, VariableDiffMatch[]>
}

type MatchEnriched = {
    variable: Variable | null
    matches: VariableDiffMatch[]
}

type MatchesByTypeEnriched = {
    add: Record<string, MatchEnriched>
    remove: Record<string, MatchEnriched>
    notFoundAdd: Record<string, MatchEnriched>
    notFoundRemove: Record<string, MatchEnriched>
    addUnknown: Record<string, MatchEnriched>
    removeUnknown: Record<string, MatchEnriched>
}

export default class Diff extends Base {
    static hidden = false
    authSuggested = true

    static description =
        'Print a diff of DevCycle variable usage between two versions of your code.'
    static examples = [
        '<%= config.bin %> <%= command.id %>',
        '<%= config.bin %> <%= command.id %> ' +
            '--match-pattern js="dvcClient\\.variable\\(\\s*["\']([^"\']*)["\']"',
    ]

    static flags = {
        ...Base.flags,
        include: Flags.string({
            description:
                'Files to include in the diff. By default all files are included. ' +
                'Accepts multiple glob patterns.',
            multiple: true,
        }),
        exclude: Flags.string({
            description:
                'Files to exclude in the diff. By default all files are included. ' +
                'Accepts multiple glob patterns.',
            multiple: true,
        }),
        file: Flags.string({
            char: 'f',
            description: 'File path of existing diff file to inspect.',
        }),
        'client-name': ClientNameFlag,
        'match-pattern': MatchPatternFlag,
        'var-alias': VarAliasFlag,
        'pr-link': Flags.string({
            hidden: true,
            description:
                'Link to the PR to use for formatting the line number outputs with clickable links.',
        }),
        format: Flags.string({
            default: 'console',
            options: ['console', 'markdown', 'markdown-no-html'],
            description: 'Format to use when outputting the diff results.',
        }),
        'show-regex': ShowRegexFlag,
    }

    static args = {
        'diff-pattern': Args.string({
            name: 'diff-pattern',
            description:
                'A "git diff"-compatible diff pattern, eg. "branch1 branch2"',
        }),
    }

    useMarkdown = false
    useHTML = false

    public async run(): Promise<void> {
        const { args, flags } = await this.parse(Diff)

        if (!flags.file && !args['diff-pattern']) {
            this.writer.showError('Must provide a diff pattern')
            return
        }
        const codeInsightsConfig = this.repoConfig?.codeInsights || {}

        this.useMarkdown = flags.format.includes('markdown')
        this.useHTML = flags.format === 'markdown'

        let parsedDiff = flags.file
            ? executeFileDiff(flags.file)
            : args['diff-pattern']
              ? executeDiff(args['diff-pattern'])
              : []

        const fileFilter = new FileFilters(flags, codeInsightsConfig)
        parsedDiff = parsedDiff.filter(({ from = '', to = '' }) => {
            return (
                fileFilter.shouldIncludeFile(from) ||
                fileFilter.shouldIncludeFile(to)
            )
        })

        const matchesBySdk = parseFiles(parsedDiff, {
            clientNames: getClientNames(flags, this.repoConfig),
            matchPatterns: getMatchPatterns(flags, this.repoConfig),
            printPatterns: showRegex(flags),
        })

        const variableAliases = getVariableAliases(flags, this.repoConfig)

        const matchesByType = this.getMatchesByType(
            matchesBySdk,
            variableAliases,
        )

        const matchesByTypeEnriched =
            await this.fetchVariableData(matchesByType)

        this.formatOutput(matchesByTypeEnriched, flags['pr-link'])
    }

    private useApi() {
        return this.hasToken() && this.projectKey !== '' && this.noApi !== true
    }

    private getMatchesByType(
        matchesBySdk: Record<string, VariableDiffMatch[]>,
        aliasMap: Record<string, string>,
    ): MatchesByType {
        const matchesByType: MatchesByType = {
            add: {},
            remove: {},
            addUnknown: {},
            removeUnknown: {},
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
                    (m) => `${m.fileName}:${m.line}`,
                )
            })
        })
        return matchesByType
    }

    private async fetchVariableData(
        matchesByType: MatchesByType,
    ): Promise<MatchesByTypeEnriched> {
        const categories: MatchesByTypeEnriched = {
            add: {},
            remove: {},
            notFoundAdd: {},
            notFoundRemove: {},
            addUnknown: {},
            removeUnknown: {},
        }

        const fetchAndCategorize = async (
            matches: Record<string, VariableDiffMatch[]>,
            category: 'add' | 'remove',
        ) => {
            const keys = Object.keys(matches)
            const variablesByKey: Record<string, Variable | null> = {}

            if (this.useApi()) {
                const token = this.authToken
                const projectKey = this.projectKey
                await Promise.all(
                    keys.map(async (key: string) => {
                        variablesByKey[key] = await fetchVariableByKey(
                            token,
                            projectKey,
                            key,
                        )
                    }),
                )
            }

            for (const key of Object.keys(matches)) {
                categories[category][key] = {
                    variable: variablesByKey[key],
                    matches: matches[key],
                }
                if (!variablesByKey[key] && this.useApi()) {
                    categories[
                        category === 'add' ? 'notFoundAdd' : 'notFoundRemove'
                    ][key] = {
                        variable: null,
                        matches: matches[key],
                    }
                }
            }
        }

        await Promise.all([
            fetchAndCategorize(matchesByType.add, 'add'),
            fetchAndCategorize(matchesByType.remove, 'remove'),
        ])

        const enrichedAddUnknown: Record<string, MatchEnriched> = {}
        const enrichedRemoveUnknown: Record<string, MatchEnriched> = {}

        for (const [key, matches] of Object.entries(matchesByType.addUnknown)) {
            enrichedAddUnknown[key] = {
                variable: null,
                matches,
            }
        }

        for (const [key, matches] of Object.entries(
            matchesByType.removeUnknown,
        )) {
            enrichedRemoveUnknown[key] = {
                variable: null,
                matches,
            }
        }

        categories.addUnknown = enrichedAddUnknown
        categories.removeUnknown = enrichedRemoveUnknown

        return categories
    }

    private formatOutput(
        matchesByTypeEnriched: MatchesByTypeEnriched,
        prLink?: string,
    ) {
        const additions = {
            ...matchesByTypeEnriched.add,
            ...matchesByTypeEnriched.addUnknown,
        }
        const deletions = {
            ...matchesByTypeEnriched.remove,
            ...matchesByTypeEnriched.removeUnknown,
        }
        const totalAdditions = Object.keys(additions).length
        const totalDeletions = Object.keys(deletions).length
        const totalNotices =
            Object.keys(matchesByTypeEnriched.notFoundAdd).length +
            Object.keys(matchesByTypeEnriched.addUnknown).length +
            Object.keys(matchesByTypeEnriched.removeUnknown).length
        const totalCleanup = Object.keys(
            matchesByTypeEnriched.notFoundRemove,
        ).length

        const headerPrefix = this.useMarkdown ? '## ' : ''
        const headerText = 'DevCycle Variable Changes:\n'
        const subHeaderPrefix = this.useMarkdown ? '### ' : ''

        let headerIcon = ''
        if (this.useHTML) {
            const lightTogglebot = 'togglebot.svg#gh-light-mode-only'
            const darkTogglebot = 'togglebot-white.svg#gh-dark-mode-only'
            const buildIcon = (icon: string) =>
                `<img src="https://github.com/DevCycleHQ/cli/raw/main/assets/${icon}" height="31px" align="center"/>`
            headerIcon = `${buildIcon(lightTogglebot)}${buildIcon(darkTogglebot)} `
        }

        const totalChanges =
            totalAdditions + totalDeletions + totalNotices + totalCleanup
        if (totalChanges === 0) {
            this.log(
                `\n${subHeaderPrefix}${headerIcon}No DevCycle Variables Changed\n`,
            )
            return
        }
        this.log(`\n${headerPrefix}${headerIcon}${headerText}`)

        if (totalNotices) {
            this.log(
                `${EMOJI.notice}   ${totalNotices} Variable${totalNotices === 1 ? '' : 's'} With Notices`,
            )
        }
        this.log(
            `${EMOJI.add}  ${totalAdditions} Variable${totalAdditions === 1 ? '' : 's'} Added`,
        )
        this.log(
            `${EMOJI.remove}  ${totalDeletions} Variable${totalDeletions === 1 ? '' : 's'} Removed`,
        )
        if (totalCleanup) {
            this.log(
                `${EMOJI.cleanup}  ${totalCleanup} Variable${totalCleanup === 1 ? '' : 's'} Cleaned up`,
            )
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
            this.log(
                'The following variables that do not exist in DevCycle were cleaned up:\n',
            )
            this.logCleanup(matchesByTypeEnriched)
        }
    }

    private logNotices(matchesByTypeEnriched: MatchesByTypeEnriched) {
        let offset = 0
        Object.entries(matchesByTypeEnriched.notFoundAdd).forEach(
            ([variableName], idx) => {
                this.log(
                    `  ${idx + 1}. Variable "${variableName}" does not exist on DevCycle`,
                )
                offset = idx + 1
            },
        )

        Object.entries({
            ...matchesByTypeEnriched.addUnknown,
            ...matchesByTypeEnriched.removeUnknown,
        }).forEach(([variableName], idx) => {
            this.log(
                `  ${offset + idx + 1}. ` +
                    `Variable "${variableName}" could not be identified. Try adding an alias.`,
            )
        })
    }

    private logCleanup(matchesByTypeEnriched: MatchesByTypeEnriched) {
        Object.entries(matchesByTypeEnriched.notFoundRemove).forEach(
            ([variableName], idx) => {
                this.log(`  ${idx + 1}. ${variableName}`)
            },
        )
    }

    private logMatches(
        matchesByVariable: Record<string, MatchEnriched>,
        mode: 'add' | 'remove',
        prLink?: string,
    ) {
        Object.entries(matchesByVariable).forEach(
            ([variableName, enriched], idx) => {
                const matches = enriched.matches
                const notFound = this.useApi() && !enriched.variable
                const isUnknown = enriched.matches.some(
                    (match) => match.isUnknown,
                )
                const hasNotice =
                    (mode === 'add' && (notFound || isUnknown)) ||
                    (mode === 'remove' && isUnknown)
                const hasCleanup = mode === 'remove' && notFound

                const formattedName = this.useMarkdown
                    ? `**${variableName}**`
                    : variableName

                this.log(
                    `  ${idx + 1}. ${formattedName}` +
                        `${hasNotice ? ` ${EMOJI.notice}` : ''}${hasCleanup ? ` ${EMOJI.cleanup}` : ''}`,
                )

                if (enriched.variable?.type) {
                    this.log(`\t   Type: ${enriched.variable.type}`)
                }

                this.logLocations(matches, mode, prLink)
            },
        )
    }

    private logLocations(
        matches: VariableDiffMatch[],
        mode: 'add' | 'remove',
        prLink?: string,
    ) {
        const formatPrLink = (fileName: string, line: number) => {
            const displayName = `${fileName}:L${line}`
            let link = ''
            if (prLink?.includes('bitbucket')) {
                link = `${prLink}#L${fileName}${mode === 'add' ? 'T' : 'F'}${line}`
            } else if (prLink?.includes('gitlab')) {
                // TODO: include line number in link if possible
                const sha1Hash = createHash('sha1')
                    .update(fileName)
                    .digest('hex')
                link = `${prLink}/diffs#diff-content-${sha1Hash}`
            } else {
                link = `${prLink}/files#diff-${sha256(fileName)}${mode === 'add' ? 'R' : 'L'}${line}`
            }

            return `[${displayName}](${link})`
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
