import fs from 'fs'
import minimatch from 'minimatch'
import { lsFiles } from '../../utils/git/ls-files'
import { Flags } from '@oclif/core'
import { parseFiles } from '../../utils/usages/parse'
import Base from '../base'
import { File, LineItem } from './types'

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
        'format': Flags.string({
            default: 'console',
            options: ['console', 'markdown'],
            description: 'Format to output the diff results in.'
        }),
        'show-regex': Flags.boolean({
            description: 'Output the regex pattern used to find variable usage'
        })
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

        const matchPatternsFromConfig: Record<string, string[]> = codeInsightsConfig.matchPatterns || {}
        const clientNamesFromConfig = codeInsightsConfig.clientNames || []

        const matchPatterns = (flags['match-pattern'] || []).reduce((acc, value) => {
            const [extension, pattern] = value.split('=')
            if (!extension || !pattern) {
                throw new Error(`Invalid match pattern: ${value}. Must be of the form "[FILE EXTENSION]=[PATTERN]`)
            }
            return { ...acc, [extension]: [...(acc[extension] || []), pattern] }
        }, matchPatternsFromConfig)

        const matchesBySdk = parseFiles(files, {
            clientNames: [...clientNamesFromConfig, ...(flags['client-name'] || [])],
            matchPatterns,
            printPatterns: flags['show-regex']
        })
        this.log(JSON.stringify(matchesBySdk))
    }
}
