import parse from 'parse-diff'
import { ParseOptions, VariableMatch } from './types'

type Range = {
    start: number
    end: number
}

type MultilineChunk = {
    content: string
    changes: ParsedChange[]
}

type MatchWithRange = {
    // Variable name
    name: string
    // Start/end indicies of matching substring
    range: Range
    isUnknown?: boolean
}

export type MatchResult = {
    isUnknown?: boolean
    content: string,
    name: string,
    index: number
}

class ParsedChange {
    type: string
    content: string
    ln: number
    range: Range = { start: 0, end: 0 }

    constructor(change: parse.Change) {
        this.type = change.type
        this.content = change.content
        this.ln = change.type === 'normal' ? change.ln2 : change.ln
    }

    parseContent() {
        return this.type === 'normal'
            ? this.content.trim()
            : this.content.slice(1).trim()
    }

    isComment(commentCharacters: string[]) {
        const changeContent = this.parseContent()
        return commentCharacters
            .map((char) => changeContent.indexOf(char) === 0)
            .some(Boolean)
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
    abstract identity: string
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
        this.clientNames = [...(options.clientNames || []), 'dvcClient']
    }

    private buildParameterPattern(
        namedParameterPatternMap: Record<string, RegExp> | null,
        orderedParameterPatterns: RegExp[] | null
    ) {
        const namedParameters = namedParameterPatternMap
            ? Object
                .entries(namedParameterPatternMap)
                .map(([key, pattern]) =>
                    new RegExp(
                        `(?=.*?${key}${this.namedParameterDelimiter}\\s*${pattern.source})`
                    ).source
                )
                .join('')
                .concat(/[^)]*\)/.source)
            : null

        const orderedParameters = orderedParameterPatterns
            ? orderedParameterPatterns
                .map((p) => p.source)
                .join(/\s*,\s*/.source)
                .concat(/\)/.source)
            : null

        return orderedParameters && namedParameters
            ? new RegExp(`(?:(?:${orderedParameters})|(?:${namedParameters}))`).source
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

    /**
     * Given a chunk from parse-diff, aggregate added and removed changes.
     * Each resulting chunk includes the multi-line content as a single string,
     * and an array of changes, each with a range object describing the start/end
     * indicies of the substring within the content string.
     */
    private aggregateMultilineChunks(chunk: parse.Chunk): { added: MultilineChunk, removed: MultilineChunk } {
        const added: MultilineChunk = {
            content: '',
            changes: []
        }
        const removed: MultilineChunk = {
            content: '',
            changes: []
        }

        const pushChangeToMultilineChunk = (chunk: MultilineChunk, change: ParsedChange) => {
            change.range.start = chunk.content.length

            const changeContent = change.parseContent()
            if (!changeContent.length) return

            chunk.content += changeContent
            change.range.end = chunk.content.length - 1

            chunk.changes.push(change)
        }

        for (const change of chunk.changes) {
            const parsedChange = new ParsedChange(change)
            if (parsedChange.isComment(this.commentCharacters)) continue

            if (parsedChange.type === 'add') {
                pushChangeToMultilineChunk(added, parsedChange)
            } else if (parsedChange.type === 'del') {
                pushChangeToMultilineChunk(removed, parsedChange)
            } else if (parsedChange.type === 'normal') {
                pushChangeToMultilineChunk(added, parsedChange)
                pushChangeToMultilineChunk(removed, parsedChange)
            }
        }
        return { added, removed }
    }

    match(content: string): MatchResult | null {
        const pattern = this.buildRegexPattern()

        const matches = pattern.exec(content)
        if (matches) {
            const varName = matches[1] || matches[2]
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

    private formatMatch(name: string, file: parse.File, change: parse.Change, isUnknown?: boolean): VariableMatch {
        return {
            name,
            fileName: file.to ?? '',
            line: change.type === 'normal' ? change.ln1 : change.ln,
            mode: change.type === 'add' ? 'add' : 'remove',
            ...(isUnknown ? { isUnknown: true } : {})
        }
    }

    /**
     * Given an array of matches, find the first change object corresponding to the match.
     * Also verify that the match is associated with at least one add/delete change object.
     */
    private formatMatches(file: parse.File, matches: MatchWithRange[], { changes }: MultilineChunk) {
        const results: VariableMatch[] = []

        matches.forEach((match) => {
            const { start: matchStartIndex, end: matchEndIndex } = match.range

            // Get all changes within the range of the match
            const matchingChanges = changes.filter(({ range }) => {
                const { start: changeStartIndex, end: changeEndIndex } = range
                return (matchStartIndex >= changeStartIndex && matchStartIndex <= changeEndIndex)
                    || (changeStartIndex >= matchStartIndex && changeStartIndex <= matchEndIndex)
            })

            // Remove "normal" change objects
            const validChange = matchingChanges.find(({ type }) => type !== 'normal')

            // If we have an add/del change, update the starting change to have that type and push to results
            if (validChange) {
                const formattedChange = matchingChanges[0].format(
                    validChange.type as 'add' | 'del'
                )
                results.push(this.formatMatch(match.name, file, formattedChange, match.isUnknown))
            }
        })

        return results
    }

    parse(file: parse.File): VariableMatch[] {
        const results: VariableMatch[] = []

        for (const chunk of file.chunks) {
            const { added: addedChunk, removed: removedChunk } = this.aggregateMultilineChunks(chunk)
            const addedMatches = this.getAllMatches(addedChunk.content)
            const removedMatches = this.getAllMatches(removedChunk.content)

            results.push(
                ...this.formatMatches(file, addedMatches, addedChunk),
                ...this.formatMatches(file, removedMatches, removedChunk)
            )
        }
        return results
    }
}
