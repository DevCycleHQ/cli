import fs from 'fs'
import minimatch from 'minimatch'
import { lsFiles } from '../../utils/git/ls-files'
import { Flags } from '@oclif/core'
import { parseFiles } from '../../utils/usages/parse'
import Base from '../base'
import { File, LineItem } from './types'
import ClientNameFlag, { getClientNames } from '../../flags/client-name'
import MatchPatternFlag, { getMatchPatterns } from '../../flags/match-pattern'
import VarAliasFlag, { getVariableAliases } from '../../flags/var-alias'
import ShowRegexFlag, { showRegex } from '../../flags/show-regex'

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
            options: ['console', 'markdown'],
            description: 'Format to output the diff results in.'
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
        
        const matchesByType = this.getMatchesByType(matchesBySdk, variableAliases)
        this.log(JSON.stringify(matchesBySdk))
    }
}
