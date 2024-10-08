import fs from 'fs'
import { Flags } from '@oclif/core'
import { parseFiles } from '../../utils/usages/parse'
import Base from '../base'
import { File, JSONMatch, LineItem, VariableReference } from './types'
import ClientNameFlag, { getClientNames } from '../../flags/client-name'
import MatchPatternFlag, { getMatchPatterns } from '../../flags/match-pattern'
import VarAliasFlag, { getVariableAliases } from '../../flags/var-alias'
import ShowRegexFlag, { showRegex } from '../../flags/show-regex'
import { VariableMatch, VariableUsageMatch } from '../../utils/parsers/types'
import { fetchAllVariables } from '../../api/variables'
import { Variable } from '../../api/schemas'
import { FileFilters } from '../../utils/FileFilters'
import { Writable } from 'stream'
import { createWriteStream } from 'fs'
export default class Usages extends Base {
    static hidden = false

    static description =
        'Print all DevCycle variable usages in the current version of your code.'
    static examples = [
        '<%= config.bin %> <%= command.id %>',
        '<%= config.bin %> <%= command.id %> ' +
            '--match-pattern js="dvcClient\\.variable\\(\\s*["\']([^"\']*)["\']"',
    ]

    static flags = {
        ...Base.flags,
        include: Flags.string({
            description:
                'Files to include when scanning for usages. By default all files are included. ' +
                'Accepts multiple glob patterns.',
            multiple: true,
        }),
        exclude: Flags.string({
            description:
                'Files to exclude when scanning for usages. By default all files are included. ' +
                'Accepts multiple glob patterns.',
            multiple: true,
        }),
        'client-name': ClientNameFlag,
        'match-pattern': MatchPatternFlag,
        'var-alias': VarAliasFlag,
        format: Flags.string({
            default: 'console',
            options: ['console', 'json'],
            description: 'Format to use when outputting the usage results.',
        }),
        'show-regex': ShowRegexFlag,
        'only-unused': Flags.boolean({
            description:
                'Show usages of variables that are not defined in your DevCycle config.',
        }),
        output: Flags.string({
            char: 'o',
            description:
                'Output file path for JSON format. If not specified, output will be written to stdout.',
        }),
    }

    useMarkdown = false

    public async run(): Promise<void> {
        const { flags } = await this.parse(Usages)
        const codeInsightsConfig = this.repoConfig?.codeInsights || {}

        this.useMarkdown = flags.format === 'markdown'

        const processFile = (filepath: string): File => {
            const chunkSize = 1024 * 1024 // 1MB chunks
            const fd = fs.openSync(filepath, 'r')
            const buffer = Buffer.alloc(chunkSize)
            const lines: LineItem[] = []
            let lineNumber = 1
            let remainingData = ''

            try {
                let bytesRead
                while (
                    (bytesRead = fs.readSync(fd, buffer, 0, chunkSize, null)) >
                    0
                ) {
                    const chunk =
                        remainingData + buffer.toString('utf8', 0, bytesRead)
                    const chunkLines = chunk.split('\n')
                    remainingData = chunkLines.pop() || ''

                    chunkLines.forEach((content) => {
                        lines.push({ content, ln: lineNumber++ })
                    })
                }

                if (remainingData) {
                    lines.push({ content: remainingData, ln: lineNumber })
                }
            } catch (err) {
                this.warn(`Error parsing file ${filepath}`)
                this.debug(err)
            } finally {
                fs.closeSync(fd)
            }

            return {
                name: filepath,
                lines,
            }
        }

        const fileFilters = new FileFilters(flags, codeInsightsConfig)
        const filePaths = fileFilters.getFiles()
        const batchSize = 100 // Process 100 files at a time
        const files: File[] = []

        for (let i = 0; i < filePaths.length; i += batchSize) {
            const batch = filePaths.slice(i, i + batchSize)
            const batchFiles = batch.map(processFile)
            files.push(...batchFiles)
        }
        if (!files.length) {
            this.warn('No files found to process.')
            return
        }

        const matchesBySdk = parseFiles(files, {
            clientNames: getClientNames(flags, this.repoConfig),
            matchPatterns: getMatchPatterns(flags, this.repoConfig),
            printPatterns: showRegex(flags),
        })

        const variableAliases = getVariableAliases(flags, this.repoConfig)

        const usages = this.getMatchesByVariable(matchesBySdk, variableAliases)
        if (flags['only-unused']) {
            const variablesMap = (
                await fetchAllVariables(this.authToken, this.projectKey)
            ).reduce((map: Record<string, Variable>, variable) => {
                map[variable.key] = variable
                return map
            }, {})
            Object.keys(usages).forEach((variableKey) => {
                if (variablesMap[variableKey]) {
                    delete usages[variableKey]
                }
            })
        }

        if (flags['format'] === 'json') {
            const matchesByVariableJSON = this.formatMatchesToJSON(usages)
            await this.writeJSONOutput(matchesByVariableJSON, flags.output)
        } else {
            this.formatConsoleOutput(usages)
        }
    }
    private async writeJSONOutput(
        data: JSONMatch[],
        outputPath: string | undefined,
    ): Promise<void> {
        const outputStream: Writable = outputPath
            ? createWriteStream(outputPath)
            : process.stdout

        return new Promise((resolve, reject) => {
            const jsonStream = JSON.stringify(data, null, 2)
            const writeStream = new Writable({
                write(chunk, encoding, callback) {
                    if (!outputStream.write(chunk, encoding)) {
                        outputStream.once('drain', callback)
                    } else {
                        process.nextTick(callback)
                    }
                },
            })

            writeStream.on('finish', () => {
                if (outputPath) {
                    outputStream.end(() => resolve())
                } else {
                    resolve()
                }
            })

            writeStream.on('error', reject)
            outputStream.on('error', reject)

            writeStream.write(jsonStream)
            writeStream.end()
        })
    }

    private getMatchesByVariable(
        matchesBySdk: Record<string, VariableUsageMatch[]>,
        aliasMap: Record<string, string>,
    ) {
        const matchesByVariable: Record<
            string,
            Record<string, VariableUsageMatch>
        > = {}
        Object.entries(matchesBySdk).forEach(([parser, matches]) => {
            const isCustom = parser.startsWith('custom')
            matches.forEach((m) => {
                const match = { ...m }
                const aliasedName = aliasMap[match.name]
                if (match.isUnknown && aliasedName) {
                    match.alias = match.name
                    match.name = aliasedName
                    delete match.isUnknown
                }
                // Include matches for identified keys and all matches from custom regex patterns
                if (!match.isUnknown || isCustom) {
                    matchesByVariable[match.name] ??= {}
                    matchesByVariable[match.name][
                        `${match.fileName}:${match.line}`
                    ] = match
                }
            })
        })

        // Convert each mapped entry back to an array of matches
        return Object.entries(matchesByVariable).reduce(
            (
                map: Record<string, VariableUsageMatch[]>,
                [variableName, matchesByLine],
            ) => {
                map[variableName] = Object.values(matchesByLine)
                return map
            },
            {},
        )
    }

    private formatMatchesToJSON(
        matches: Record<string, VariableUsageMatch[]>,
    ): JSONMatch[] {
        const formatVariableMatchToReference = (
            match: VariableUsageMatch,
        ): VariableReference => {
            return {
                codeSnippet: {
                    content: match.content,
                    lineNumbers: match.bufferedLines,
                },
                lineNumbers: match.lines,
                fileName: match.fileName,
                language: match.language,
            }
        }
        return Object.keys(matches).map((key) => {
            return {
                key,
                references: matches[key].map((match) =>
                    formatVariableMatchToReference(match),
                ),
            }
        })
    }

    private formatConsoleOutput(
        matchesByVariable: Record<string, VariableMatch[]>,
    ) {
        if (!Object.keys(matchesByVariable).length) {
            this.log('\nNo DevCycle Variable Usages Found\n')
            return
        }

        this.log('\nDevCycle Variable Usage:\n')
        Object.entries(matchesByVariable).forEach(
            ([variableName, matches], idx) => {
                this.log(`${idx + 1}. ${variableName}`)

                matches.sort((a, b) => {
                    if (a.fileName === b.fileName)
                        return a.line > b.line ? 1 : -1
                    return a.fileName > b.fileName ? 1 : -1
                })

                matches.forEach(({ fileName, line }) => {
                    this.log(`\t- ${fileName}:L${line}`)
                })
            },
        )
    }
}
