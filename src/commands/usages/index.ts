import fs from 'fs'
import { lsFiles } from '../../utils/git/ls-files'
import { Flags } from '@oclif/core'
import { parseFiles } from '../../utils/usages/parse'
import Base from '../base'
import { File, LineItem } from './types'

export default class Usages extends Base {
    static hidden = false
    authSuggested = true

    static description = 'Print all DevCycle variable usage in the current version of your code.'
    static examples = [
        '<%= config.bin %> <%= command.id %>',
        '<%= config.bin %> <%= command.id %> ' +
        '--match-pattern javascript="dvcClient\\.variable\\(\\s*["\']([^"\']*)["\']"',
    ]

    static flags = {
        ...Base.flags,
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

    static args = [
        { name: 'diff-pattern', description: 'A "git diff"-compatible diff pattern, eg. "branch1 branch2"' },
    ]

    useMarkdown = false

    public async run(): Promise<void> {
        const { flags } = await this.parse(Usages)

        this.useMarkdown = flags.format === 'markdown'

        const files = lsFiles().map((filename): File => {
            let lines: LineItem[] = []
            try {
                lines = fs
                    .readFileSync(filename, 'utf8')
                    .split('\n')
                    .map((content, ln) => ({ content, ln }))
            } catch (err) {
                this.warn(`Error parsing file ${filename}`)
                this.debug(err)
            }
            return {
                name: filename,
                lines
            }
        })

        const codeInsightsConfig = this.configFromFile?.codeInsights || {}

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
