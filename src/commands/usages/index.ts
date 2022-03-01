import fs from 'fs'
import { uniqBy } from 'lodash'
import minimatch from 'minimatch'
import { Flags } from '@oclif/core'
import { lsFiles } from '../../utils/git/ls-files'
import { parseFiles } from '../../utils/usages/parse'
import Base from '../base'
import { File, LineItem } from './types'
import ClientNameFlag, { getClientNames } from '../../flags/client-name'
import MatchPatternFlag, { getMatchPatterns } from '../../flags/match-pattern'
import VarAliasFlag, { getVariableAliases } from '../../flags/var-alias'
import ShowRegexFlag, { showRegex } from '../../flags/show-regex'
import { VariableMatch } from '../../utils/parsers/types'

export default class Usages extends Base {
    static hidden = false

    static description = 'Print all DevCycle variable usages in the current version of your code.'
    static examples = [
        '<%= config.bin %> <%= command.id %>',
        '<%= config.bin %> <%= command.id %> ' +
        '--match-pattern javascript="dvcClient\\.variable\\(\\s*["\']([^"\']*)["\']"',
    ]

    static flags = {
        ...Base.flags,
        'include': Flags.string({
            description: 'Files to include when scanning for usages. By default all files are included. ' +
                'Accepts multiple glob patterns.',
            multiple: true
        }),
        'exclude': Flags.string({
            description: 'Files to exclude when scanning for usages. By default all files are included. ' +
                'Accepts multiple glob patterns.',
            multiple: true
        }),
        'client-name': ClientNameFlag,
        'match-pattern': MatchPatternFlag,
        'var-alias': VarAliasFlag,
        'format': Flags.string({
            default: 'console',
            options: ['console', 'json'],
            description: 'Format to use when outputting the usage results.'
        }),
        'show-regex': ShowRegexFlag
    }

    useMarkdown = false

    public async run(): Promise<void> {
        const { flags } = await this.parse(Usages)
        const codeInsightsConfig = this.configFromFile?.codeInsights || {}

        this.useMarkdown = flags.format === 'markdown'

        const includeFile = (filepath: string) => {
            const includeGlobs = flags['include'] || codeInsightsConfig.includeFiles
            return includeGlobs
                ? includeGlobs.some((glob) => minimatch(filepath, glob, { matchBase: true }))
                : true
        }

        const excludeFile = (filepath: string) => {
            const excludeGlobs = flags['exclude'] || codeInsightsConfig.excludeFiles
            return excludeGlobs
                ? excludeGlobs.some((glob) => minimatch(filepath, glob, { matchBase: true }))
                : false
        }

        const processFile = (filepath: string): File => {
            let lines: LineItem[] = []
            try {
                lines = fs
                    .readFileSync(filepath, 'utf8')
                    .split('\n')
                    .map((content, ln) => ({ content, ln }))
            } catch (err) {
                this.warn(`Error parsing file ${filepath}`)
                this.debug(err)
            }
            return {
                name: filepath,
                lines
            }
        } 

        const files = lsFiles()
            .filter((filepath) => includeFile(filepath) && !excludeFile(filepath))
            .map(processFile)

        if (!files.length) {
            this.warn('No files found to process.')
        }

        const matchesBySdk = parseFiles(files, {
            clientNames: getClientNames(flags, this.configFromFile),
            matchPatterns: getMatchPatterns(flags, this.configFromFile),
            printPatterns: showRegex(flags)
        })

        const variableAliases = getVariableAliases(flags, this.configFromFile)
        
        const matchesByVariable = this.getMatchesByVariable(matchesBySdk, variableAliases)
        
        if (flags['format'] === 'json') {
            this.log(JSON.stringify(matchesByVariable))
        } else {
            this.formatConsoleOutput(matchesByVariable)
        }
    }

    private getMatchesByVariable(
        matchesBySdk: Record<string, VariableMatch[]>,
        aliasMap: Record<string, string>
    ) {
        const matchesByVariable: Record<string, VariableMatch[]> = {}
        Object.values(matchesBySdk).forEach((matches) => {
            matches.forEach((m) => {
                const match = { ...m }
                const aliasedName = aliasMap[match.name]
                if (match.isUnknown && aliasedName) {
                    match.alias = match.name
                    match.name = aliasedName
                    delete match.isUnknown
                }
                matchesByVariable[match.name] ??= []
                matchesByVariable[match.name].push(match)
                matchesByVariable[match.name] = uniqBy(
                    matchesByVariable[match.name],
                    (m) => `${m.fileName}:${m.line}`
                )
            })
        })
        return matchesByVariable
    }

    private formatConsoleOutput(matchesByVariable: Record<string, VariableMatch[]>) {
        this.log('DevCycle Variable Usage:')
        Object.entries(matchesByVariable).forEach(([variableName, matches], idx) => {
            this.log(`${idx + 1}. ${variableName}`)

            matches.sort((a, b) => {
                if (a.fileName === b.fileName) return a.line > b.line ? 1 : -1
                return a.fileName > b.fileName ? 1 : -1
            })

            matches.forEach(({ fileName, line }) => {
                this.log(`\t- ${fileName}:L${line}`)
            })
        })
    }
}
