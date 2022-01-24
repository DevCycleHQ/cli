import parse from 'parse-diff'
import { ParseOptions, VariableMatch } from './types'

type Range = {
    start: number
    end: number
}

type MultilineChunk = {
    content: string
    changes: {
        change: parse.Change
        range: Range
    }[]
}

type Match = {
    // Variable name
    name: string
    // Start/end indicies of matching substring
    range: Range
}

export abstract class BaseParser {
    abstract identity: string
    clientNames: string[]
    abstract variableMethodPattern: RegExp
    abstract variableNameCapturePattern: RegExp

    constructor(extension: string, protected options: ParseOptions) {
        this.clientNames = [...(options.clientNames || []), 'dvcClient']
    }

    buildRegexPattern(): RegExp {
        return new RegExp(
            new RegExp(`(?:${this.clientNames.join('|')})`).source
            + this.variableMethodPattern.source
            + this.variableNameCapturePattern.source
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

        const pushChangeToMultilineChunk = (chunk: MultilineChunk, change: parse.Change) => {
            const range = { start: 0, end: 0 }
            range.start = chunk.content.length
            const changeContent = change.type === 'normal'
                ? change.content.trim()
                : change.content.slice(1).trim()
            chunk.content += changeContent
            range.end = chunk.content.length - 1
            if (changeContent.length) {
                chunk.changes.push({ range, change })
            }
        }

        for (const change of chunk.changes) {
            if (change.type === 'add') {
                pushChangeToMultilineChunk(added, change)
            } else if (change.type === 'del') {
                pushChangeToMultilineChunk(removed, change)
            } else if (change.type === 'normal') {
                pushChangeToMultilineChunk(added, change)
                pushChangeToMultilineChunk(removed, change)
            }
        }
        return { added, removed }
    }

    abstract match(content: string, options: ParseOptions): RegExpExecArray | null

    /**
     * Given a string, returns all matches found in the string.
     * Each match includes the variable name and the character range of the
     * matching substring.
     */
    private getAllMatches(content: string, options: ParseOptions): Match[] {
        const matches: Match[] = []
        let cursorPosition = 0

        while (cursorPosition < content.length) {
            const substring = content.slice(cursorPosition)
            const match = this.match(substring, options)

            if (!match) break

            const [matchContent, variableName] = match
            const startIndex = cursorPosition + match.index
            const endIndex = startIndex + matchContent.length - 1

            matches.push({
                name: variableName,
                range: {
                    start: startIndex,
                    end: endIndex
                }
            })
            cursorPosition = endIndex + 1
        }

        return matches
    }

    private formatChange(type: 'add' | 'del', change: parse.Change): parse.AddChange | parse.DeleteChange {
        const baseChange = {
            type,
            ln: change.type === 'normal' ? change.ln2 : change.ln,
            content: change.content
        }
        return type === 'add'
            ? { ...baseChange, type, add: true }
            : { ...baseChange, type, del: true }

    }

    private formatMatch(name: string, file: parse.File, change: parse.Change): VariableMatch {
        return {
            name,
            fileName: file.to ?? '',
            line: change.type === 'normal' ? change.ln1 : change.ln,
            mode: change.type === 'add' ? 'add' : 'remove'
        }
    }

    /**
     * Given an array of matches, find the first change object corresponding to the match.
     * Also verify that the match is associated with at least one add/delete change object.
     */
    private formatMatches(file: parse.File, matches: Match[], { changes }: MultilineChunk) {
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
            const validChange = matchingChanges.find(({ change }) => change.type !== 'normal')?.change

            // If we have an add/del change, update the starting change to have that type and push to results
            if (validChange) {
                const startingChange = matchingChanges[0].change
                const formattedChange = this.formatChange(
                    validChange.type as 'add' | 'del',
                    startingChange
                )
                results.push(this.formatMatch(match.name, file, formattedChange))
            }
        })

        return results
    }

    parse(file: parse.File, options: ParseOptions = {}): VariableMatch[] {
        const results: VariableMatch[] = []

        for (const chunk of file.chunks) {
            const { added: addedChunk, removed: removedChunk } = this.aggregateMultilineChunks(chunk)
            const addedMatches = this.getAllMatches(addedChunk.content, options)
            const removedMatches = this.getAllMatches(removedChunk.content, options)

            results.push(
                ...this.formatMatches(file, addedMatches, addedChunk),
                ...this.formatMatches(file, removedMatches, removedChunk)
            )
        }
        return results
    }
}
