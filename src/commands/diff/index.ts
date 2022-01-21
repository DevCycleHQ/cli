import { executeDiff } from '../../utils/diff/diff'
import { Command, Flags } from '@oclif/core'
import * as emoji from 'node-emoji'
import { executeFileDiff } from '../../utils/diff/fileDiff'
import { parseFiles } from '../../utils/diff/parse'
import { VariableMatch } from '../../utils/diff/parsers/types'
import Base from '../base'

const EMOJI = {
    add: emoji.get('white_check_mark'),
    remove: emoji.get('x')
}

export default class Diff extends Base {
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
        })
    }

    static args = [
        { name: 'diff-pattern', description: 'A "git diff"-compatible diff pattern, eg. "branch1 branch2"' },
    ]

    public async run(): Promise<void> {
        const { args, flags } = await this.parse(Diff)

        if (!flags.file && !args['diff-pattern']) {
            throw new Error('Must provide a diff pattern')
        }

        const parsedDiff = flags.file ? executeFileDiff(flags.file) : executeDiff(args['diff-pattern'])

        const matchPatternsFromConfig: Record<string, string[]> = this.configFromFile?.codeInsights?.matchPatterns || {}
        const clientNamesFromConfig = this.configFromFile?.codeInsights?.clientNames || []

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

        this.formatOutput(matchesBySdk)
    }

    private formatOutput(matchesBySdk: Record<string, VariableMatch[]>) {
        const matchesByType: Record<string, Record<string, VariableMatch[]>> = {
            add: {},
            remove: {}
        }
        Object.values(matchesBySdk).forEach((matches) => {
            matches.forEach((match) => {
                matchesByType[match.mode] ??= {}
                matchesByType[match.mode][match.name] ??= []
                matchesByType[match.mode][match.name].push(match)
            })
        })

        const totalAdditions = Object.keys(matchesByType.add).length
        const totalDeletions = Object.keys(matchesByType.remove).length

        this.log('\nDevCycle Variable Changes:\n')
        this.log(`${EMOJI.add} ${totalAdditions} Variable${totalAdditions === 1 ? '' : 's'} Added`)
        this.log(`${EMOJI.remove} ${totalDeletions} Variable${totalDeletions === 1 ? '' : 's'} Removed`)

        if (totalAdditions) {
            this.log(`\n${EMOJI.add} Added\n`)
            this.logMatches(matchesByType.add)
        }

        if (totalDeletions) {
            this.log(`\n${EMOJI.remove} Removed\n`)
            this.logMatches(matchesByType.remove)
        }
    }

    private logMatches(matchesByVariable: Record<string, VariableMatch[]>) {
        Object.entries(matchesByVariable).forEach(([variableName, matches], idx) => {
            this.log(`\t${idx + 1}. ${variableName}`)
            matches.sort((a, b) => {
                if (a.fileName === b.fileName) return a.line > b.line ? 1 : -1
                return a.fileName > b.fileName ? 1 : -1
            })

            if (matches.length === 1) {
                const { fileName, line } = matches[0]
                this.log(`\t   Location: ${fileName}:L${line}`)
            } else {
                this.log('\t   Locations:')
                matches.forEach(({ fileName, line }) => {
                    this.log(`\t    - ${fileName}:L${line}`)
                })
            }
        })
    }
}
