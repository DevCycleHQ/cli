import parse from 'parse-diff'
import { ParseOptions, VariableDiffMatch, Range, VariableUsageMatch } from './types'
import * as usage from '../../commands/usages/types'
import { LANGUAGE_MAP } from '../parsers'

type MatchWithRange = {
    // Variable name
    name: string
    // Start/end indicies of matching substring
    range: Range
    // true if the found key is not wrapped in quotes
    isUnknown?: boolean
}

export type MatchResult = {
    // true if the found key is not wrapped in quotes
    isUnknown?: boolean
    // content matching the pattern
    content: string
    // variable key found within match
    name: string
    // index of matching substring within parent string
    index: number
}

class ParsedLine {
    // Line content
    content: string
    // Trimmed line content
    parsedContent: string
    //  Line number
    ln: number
    // Start/end of content within full content string
    range: Range = { start: 0, end: 0 }

    constructor(line: usage.LineItem) {
        this.content = line.content
        this.parsedContent = this.content.trim()
        this.ln = line.ln
    }

    isComment(commentCharacters: string[]) {
        return commentCharacters
            .map((char) => this.parsedContent.indexOf(char) === 0)
            .some(Boolean)
    }

    isEmpty() {
        return this.parsedContent.length === 0
    }
}

class ParsedChangeLine extends ParsedLine {
    // Type of change
    type: string

    constructor(changeLine: parse.Change) {
        super(changeLine as usage.LineItem)
        this.type = changeLine.type
        this.content = changeLine.content
        this.parsedContent = this.type === 'normal'
            ? this.content.trim()
            : this.content.slice(1).trim()
        this.ln = changeLine.type === 'normal' ? changeLine.ln2 : changeLine.ln
    }

    format(type: 'add' | 'del'): parse.AddChange | parse.DeleteChange {
        const baseChange = {
            type,
            ln: this.ln,
            content: this.content
        }
        return type === 'add'
            ? { ...baseChange, type, add: true }
            : { ...baseChange, type, del: true }

    }
}

export abstract class BaseParser {
    identity: string
    // whether to add the client name (eg. dvcClient) at the beginning of the pattern
    matchClientName = true

    // list of custom client names to also match against
    clientNames: string[]

    // regex pattern to use to match the start of the "variable" method call, eg. `.variable(`
    abstract variableMethodPattern: RegExp

    // a list of patterns to use to match each positional parameter expected in the variable call,
    // and the closing bracket, eg. user, variable, default)
    orderedParameterPatterns: RegExp[] | null = null

    // delimiter to use when detecting "named" parameters, eg. dvcClient.variable(variable=variable, default=default)
    namedParameterDelimiter = '='

    // a map of named parameter names to the patterns used to detect them eg. {user: /someregex/}
    namedParameterPatternMap: Record<string, RegExp> | null = null

    // comment characters to look for when matching. Varies by language.
    commentCharacters: string[] = ['//']

    constructor(extension: string, protected options: ParseOptions) {
        this.clientNames = [...(options.clientNames || []), 'dvcClient', 'client', 'devcycle']
    }

    private buildParameterPattern(
        namedParameterPatternMap: Record<string, RegExp> | null,
        orderedParameterPatterns: RegExp[] | null
    ) {
        const namedParameters = namedParameterPatternMap
            ? Object.entries(namedParameterPatternMap)
                .map(
                    ([key, pattern]) =>
                        new RegExp(
                            `(?=.*?${key}${this.namedParameterDelimiter}\\s*${pattern.source})`,
                        ).source,
                )
                .join('')
                .concat(/[^)]*\)/.source)
            : null

        const orderedParameters = orderedParameterPatterns
            ? orderedParameterPatterns
                .map((p) => p.source)
                .join(/\s*,\s*/.source)
                .concat(/[,\s]*\)/.source)
            : null

        return orderedParameters && namedParameters
            ? new RegExp(`(?:(?:${orderedParameters})|(?:${namedParameters}))`)
                .source
            : orderedParameters || namedParameters
    }

    private buildClientNamePattern() {
        return this.matchClientName
            ? new RegExp(`(?:${this.clientNames.join('|')})`).source
            : ''
    }

    private buildRegexPattern() {
        const clientNamePattern = this.buildClientNamePattern()

        const parameterPattern = this.buildParameterPattern(
            this.namedParameterPatternMap,
            this.orderedParameterPatterns
        )

        return new RegExp(
            clientNamePattern
            + this.variableMethodPattern.source
            + parameterPattern
        )
    }

    printRegexPattern(): void {
        console.log(`Pattern for ${this.identity} parser: \n\t${this.buildRegexPattern().source}`)
    }

    match(content: string): MatchResult | null {
        const pattern = this.buildRegexPattern()

        const matches = pattern.exec(content)
        if (matches) {
            const varName = (matches[1] || matches[2]).trim()
            return {
                isUnknown: !varName.match(/^["'].*["']$/),
                // position or named parameter match
                name: varName.replace(/^["']|["']$/g, ''),
                content: matches[0],
                index: matches.index
            }
        }

        return null
    }

    /**
     * Given a string, returns all matches found in the string.
     * Each match includes the variable name and the character range of the
     * matching substring.
     */
    private getAllMatches(matchString: string): MatchWithRange[] {
        const allMatches: MatchWithRange[] = []
        let cursorPosition = 0

        while (cursorPosition < matchString.length) {
            const substring = matchString.slice(cursorPosition)
            const match = this.match(substring)

            if (!match) break

            const { content, index, name, isUnknown } = match

            const startIndex = cursorPosition + index
            const endIndex = startIndex + content.length - 1

            allMatches.push({
                name,
                isUnknown,
                range: {
                    start: startIndex,
                    end: endIndex
                }
            })
            cursorPosition = endIndex + 1
        }

        return allMatches
    }

    /**
     * Filter unused lines and build an object containing lines and content
     */
    private filterAndReduceLines(lines: ParsedChangeLine[]): { content: string, lines: ParsedChangeLine[] };
    private filterAndReduceLines(lines: ParsedLine[]): { content: string, lines: ParsedLine[] };
    private filterAndReduceLines(lines: ParsedLine[]): { content: string, lines: ParsedLine[] } {
        return lines
            .filter((line) => !line.isComment(this.commentCharacters) && !line.isEmpty())
            .reduce((acc, line) => {
                line.range.start = acc.content.length

                acc.content += line.parsedContent
                line.range.end = acc.content.length - 1

                acc.lines.push(line)

                return acc
            }, { content: '', lines: [] } as { content: string, lines: ParsedLine[] })
    }

    /**
     * Get all lines within the range of the match
     */
    private getMatchingLines(match: MatchWithRange, lines: ParsedChangeLine[]): ParsedChangeLine[];
    private getMatchingLines(match: MatchWithRange, lines: ParsedLine[]): ParsedLine[];
    private getMatchingLines(match: MatchWithRange, lines: ParsedLine[]): ParsedLine[] {
        const { start: matchStartIndex, end: matchEndIndex } = match.range

        return lines.filter(({ range }) => {
            const { start: lineStartIndex, end: lineEndIndex } = range
            return (matchStartIndex >= lineStartIndex && matchStartIndex <= lineEndIndex)
                || (lineStartIndex >= matchStartIndex && lineStartIndex <= matchEndIndex)
        })
    }

    /**
     * Parse a git diff for variable changes
     */
    parseDiffs(file: parse.File): VariableDiffMatch[] {
        const results: VariableDiffMatch[] = []

        const validateAndFormatMatch = (match: MatchWithRange, lines: ParsedChangeLine[]) => {
            const matchingLines = this.getMatchingLines(match, lines)

            // Remove "normal" lines
            const validChange = matchingLines.find(({ type }) => type !== 'normal')

            // If we have an add/del change, update the starting line to have that type and push to results
            if (validChange) {
                const line = matchingLines[0].format(validChange.type as 'add' | 'del')
                results.push({
                    name: match.name,
                    fileName: file.to ?? '',
                    line: line.ln,
                    mode: line.type === 'add' ? 'add' : 'remove',
                    ...(match.isUnknown ? { isUnknown: true } : {})
                })
            }
        }

        for (const chunk of file.chunks) {
            const lineChanges = chunk.changes.map((change) => new ParsedChangeLine(change))

            const addedLines = lineChanges.filter((line) => ['add', 'normal'].includes(line.type))
            const added = this.filterAndReduceLines(addedLines)
            const addedMatches = this.getAllMatches(added.content)

            addedMatches.forEach((match) => validateAndFormatMatch(match, added.lines))

            const removedLines = lineChanges.filter((line) => ['del', 'normal'].includes(line.type))
            const removed = this.filterAndReduceLines(removedLines)
            const removedMatches = this.getAllMatches(removed.content)

            removedMatches.forEach((match) => validateAndFormatMatch(match, removed.lines))
        }
        return results
    }

    /**
     * Parse an entire file for code references
     */
    parseFile(file: usage.File): VariableUsageMatch[] {
        const buffer = 3
        const results: VariableUsageMatch[] = []
        const fileExtension = file.name?.split('.').pop() ?? ''

        const parsedLines = file.lines.map((line) => new ParsedLine(line))
        const { lines, content } = this.filterAndReduceLines(parsedLines)
        const matches = this.getAllMatches(content)

        matches.forEach((match) => {
            const matchingLines = this.getMatchingLines(match, lines)

            const range = {
                start: matchingLines[0].ln,
                end: matchingLines[matchingLines.length - 1].ln
            }

            const bufferedStart = Math.max(range.start - buffer, 0)
            const bufferedEnd = Math.min(range.end + buffer, file.lines.length)
            const bufferedContent = file.lines
                .filter((line) => range.start - buffer <= line.ln && range.end + buffer >= line.ln)
                .map((line) => line.content)
                .join('\n')

            results.push({
                name: match.name,
                line: range.start,
                lines: range,
                bufferedLines: {
                    start: bufferedStart,
                    end: bufferedEnd
                },
                fileName: file.name,
                content: bufferedContent,
                language: LANGUAGE_MAP[fileExtension],
                ...(match.isUnknown ? { isUnknown: true } : {})
            })
        })

        return results
    }
}
