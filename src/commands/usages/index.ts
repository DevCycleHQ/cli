import fs from 'fs'
import minimatch from 'minimatch'
import { Flags } from '@oclif/core'
import { execSync } from 'child_process'
import { lsFiles } from '../../utils/git/ls-files'
import { parseFiles } from '../../utils/usages/parse'
import Base from '../base'
import { CreateVariableParams, fetchVariables } from '../../api/variables'
import { File, JSONMatch, LineItem, VariableReference } from './types'
import ClientNameFlag, { getClientNames } from '../../flags/client-name'
import MatchPatternFlag, { getMatchPatterns } from '../../flags/match-pattern'
import VarAliasFlag, { getVariableAliases } from '../../flags/var-alias'
import ShowRegexFlag, { showRegex } from '../../flags/show-regex'
import { VariableMatch, VariableUsageMatch } from '../../utils/parsers/types'
import {
    selectMissingVariablesPrompt,
    selectActionPrompt,
    inputVariableTypePrompt,
    inputDefaultValuePrompt,
} from '../../ui/prompts/usagesPrompts'
import CreateFeature from '../../commands/features/create'
import { CreateFeatureParams } from '../../api/features'
import { QuestionCollection, prompt } from 'inquirer'

export default class Usages extends Base {
    static hidden = false
    runsInRepo = true

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

        blame: Flags.boolean({
            default: false,
            char: 'b',
            description: 'Include git blame information for missing variables',
        }),
        create: Flags.boolean({
            char: 'c',
            description: 'Create missing variables',
            default: false,
        }),
    }
    static args = [
        {
            name: 'command',
            description: 'find-missing or other command',
            required: false,
            default: '',
        },
    ]

    useMarkdown = false

    public async run(): Promise<void> {
        const { args, flags } = await this.parse(Usages)
        const codeInsightsConfig = this.repoConfig?.codeInsights || {}

        this.useMarkdown = flags.format === 'markdown'

        const includeFile = (filepath: string) => {
            const includeGlobs =
                flags['include'] || codeInsightsConfig.includeFiles
            return includeGlobs
                ? includeGlobs.some((glob) =>
                      minimatch(filepath, glob, { matchBase: true }),
                  )
                : true
        }

        const excludeFile = (filepath: string) => {
            const excludeGlobs =
                flags['exclude'] || codeInsightsConfig.excludeFiles
            return excludeGlobs
                ? excludeGlobs.some((glob) =>
                      minimatch(filepath, glob, { matchBase: true }),
                  )
                : false
        }

        const processFile = (filepath: string): File => {
            let lines: LineItem[] = []
            try {
                lines = fs
                    .readFileSync(filepath, 'utf8')
                    .split('\n')
                    .map((content, idx) => ({ content, ln: idx + 1 }))
            } catch (err) {
                this.warn(`Error parsing file ${filepath}`)
                this.debug(err)
            }
            return {
                name: filepath,
                lines,
            }
        }

        const files = lsFiles()
            .filter(
                (filepath) => includeFile(filepath) && !excludeFile(filepath),
            )
            .map(processFile)

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

        const matchesByVariable = this.getMatchesByVariable(
            matchesBySdk,
            variableAliases,
        )

        if (args.command === 'find-missing') {
            await this.findMissingVariables(matchesByVariable, flags['blame'])
            if (flags['create']) {
                // Handle the --create flag
                await this.createMissingVariables(matchesByVariable)
            }
        } else {
            if (flags['format'] === 'json') {
                const matchesByVariableJSON =
                    this.formatMatchesToJSON(matchesByVariable)
                this.log(JSON.stringify(matchesByVariableJSON, null, 2))
            } else {
                this.formatConsoleOutput(matchesByVariable)
            }
        }
    }

    private getGitBlame(fileName: string, lineNumber: number): string {
        try {
            const output = execSync(
                `git blame -L ${lineNumber},${lineNumber} -- ${fileName}`,
                { encoding: 'utf8' },
            )
            return output.trim()
        } catch (error) {
            this.warn(`Error running git blame for ${fileName}:L${lineNumber}`)
            this.debug(error)
            return ''
        }
    }

    private async findMissingVariables(
        matchesByVariable: Record<string, VariableMatch[]>,
        blame: boolean,
    ): Promise<void> {
        await this.requireProject()
        const devCycleVariables = await fetchVariables(
            this.token,
            this.projectKey,
        )
        const devCycleVariableKeys = devCycleVariables.map(
            (variable) => variable.key,
        )

        const codeVariables = Object.keys(matchesByVariable)

        const missingVariables = codeVariables.filter(
            (codeVariable) => !devCycleVariableKeys.includes(codeVariable),
        )

        if (missingVariables.length > 0) {
            this.log('\nVariables found in code but not in DevCycle:')
            missingVariables.forEach((missingVariable, idx) => {
                this.log(`${idx + 1}. ${missingVariable}`)
                matchesByVariable[missingVariable].forEach(
                    ({ fileName, line }) => {
                        if (blame) {
                            const blameInfo = this.getGitBlame(fileName, line)
                            const formattedBlame =
                                this.formatGitBlame(blameInfo)
                            this.log(
                                `\t- ${fileName}:L${line} (${formattedBlame})`,
                            )
                        } else {
                            this.log(`\t- ${fileName}:L${line}`)
                        }
                    },
                )
            })
        } else {
            this.log('\nAll variables in code are present in DevCycle')
        }
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
                if (isNaN(parseInt(variableName))) {
                    this.log(`${idx + 1}. ${variableName}`)

                    matches.sort((a, b) => {
                        if (a.fileName === b.fileName)
                            return a.line > b.line ? 1 : -1
                        return a.fileName > b.fileName ? 1 : -1
                    })

                    matches.forEach(({ fileName, line }) => {
                        this.log(`\t- ${fileName}:L${line}`)
                    })
                }
            },
        )
    }

    private async createMissingVariables(
        matchesByVariable: Record<string, VariableMatch[]>,
    ): Promise<void> {
        const missingVariables = Object.keys(matchesByVariable)

        function isVariableType(
            value: string,
        ): value is 'String' | 'Boolean' | 'Number' | 'JSON' {
            return ['String', 'Boolean', 'Number', 'JSON'].includes(value)
        }

        function inputDefaultValuePrompt(
            state: 'ON' | 'OFF',
        ): QuestionCollection {
            return [
                {
                    type: 'input',
                    name: `defaultValue${state}`,
                    message: `Enter the default value for the '${state}' state:`,
                },
            ]
        }

        // Prompt the user to select which variables they want to create
        const selectedVariables = await prompt(
            selectMissingVariablesPrompt(missingVariables),
        )
        console.log('selectedVariables', selectedVariables)

        if (selectedVariables !== null) {
            // For each selected variable, prompt the user to choose an action
            // for (const variableKey of selectedVariables.variableKey) {
            const action = await prompt(
                selectActionPrompt(selectedVariables.variableKey),
            )

            if (action !== null) {
                // Take appropriate action based on the user's choice
                switch (action.action) {
                    case 'create_variable':
                        // Create the variable here
                        // ...
                        break
                    case 'create_feature':
                        {
                            // Create a feature with the new variable
                            const createFeatureCommand = new CreateFeature(
                                [],
                                this.config,
                            )
                            createFeatureCommand.token = this.token
                            createFeatureCommand.projectKey = this.projectKey

                            const featureParams: CreateFeatureParams = {
                                name: `Feature for ${selectedVariables.variableKey}`,
                                description: `A feature for the ${selectedVariables.variableKey} variable.`,
                                key: selectedVariables.variableKey,
                                variables: [],
                            }
                            const { type: variableType } = (await prompt(
                                inputVariableTypePrompt(),
                            )) as unknown as {
                                type: string
                            }

                            if (!isVariableType(variableType)) {
                                throw new Error('Invalid variable type')
                            }

                            const variableParams: CreateVariableParams = {
                                key: selectedVariables.variableKey,
                                name: `Variable for ${selectedVariables.variableKey}`,
                                description: `A variable for the ${selectedVariables.variableKey} feature.`,
                                type: variableType,
                                _feature: '',
                            }

                            // Prompt user for default values for the 'ON' and 'OFF' states
                            const { defaultValueOn } = await prompt(
                                inputDefaultValuePrompt('ON'),
                            )
                            const { defaultValueOff } = await prompt(
                                inputDefaultValuePrompt('OFF'),
                            )

                            await createFeatureCommand.createFeatureWithVariable(
                                featureParams,
                                variableParams,
                                defaultValueOn,
                                defaultValueOff,
                            )
                        }
                        break
                    case 'associate':
                        // Associate the variable with an existing feature here
                        // ...
                        break
                }
            }
            // }
        }
    }

    private formatGitBlame(blame: string): string {
        const match = blame.match(
            /\((.+?)\s+(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} [+-]\d{4})\s+(\d+)\)/,
        )
        if (match) {
            const author = match[1].trim()
            const date = match[2].trim()
            return `${author} on ${date}`
        }
        return 'Unknown'
    }
}
