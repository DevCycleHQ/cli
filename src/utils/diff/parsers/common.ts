import parse from 'parse-diff'
import { ParseOptions, VariableMatch } from './types'

type Chunk = {
    content: string
    changes: {
        change: parse.Change
        range: {
            start: number
            end: number
        }
    }[]
}

type Match = {
    name: string
    index: number
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
     * Each resulting chunk includes the content as a single string, and an array of
     * changes with a range describing the start/end of the substring.
     */
    private splitChunks(chunk: parse.Chunk): { added: Chunk, removed: Chunk } {
        const added: Chunk = {
            content: '',
            changes: []
        }
        const removed: Chunk = {
            content: '',
            changes: []
        }

        const pushChangeToChunk = (chunk: Chunk, change: parse.Change) => {
            const range = { start: 0, end: 0 }
            range.start = chunk.content.length
            chunk.content += change.type === 'normal'
                ? change.content.trim()
                : change.content.slice(1).trim()
            range.end = chunk.content.length
            chunk.changes.push({ range, change })
        }

        for (const change of chunk.changes) {
            if (change.type === 'add') {
                pushChangeToChunk(added, change)
            } else if (change.type === 'del') {
                pushChangeToChunk(removed, change)
            } else if (change.type === 'normal') {
                pushChangeToChunk(added, {
                    type: 'add',
                    add: true,
                    ln: change.ln2,
                    content: change.content
                })
                pushChangeToChunk(removed, {
                    type: 'del',
                    del: true,
                    ln: change.ln2,
                    content: change.content
                })
            }
        }
        return { added, removed }
    }

    abstract match(content: string, options: ParseOptions): RegExpExecArray | null

    /**
     * Given a string, returns all matches and their index in the string.
     * Each match includes the variable name and index of the substring
     */
    private getAllMatches(multiLineContent: string, options: ParseOptions): Match[] {
        const matches: Match[] = []

        const getNextMatch = (content: string) => {
            const match = this.match(content, options)

            if (match) {
                const [fullStringMatch, variableName] = match
                const remainingContent = content.slice(match.index + fullStringMatch.length)

                matches.push({
                    name: variableName,
                    index: multiLineContent.length - content.length + match.index
                })
                getNextMatch(remainingContent)
            }
        }

        getNextMatch(multiLineContent)

        return matches
    }

    private formatMatch(name: string, file: parse.File, change: parse.Change): VariableMatch {
        return {
            name,
            fileName: file.to ?? '',
            line: change.type === 'normal' ? change.ln1 : change.ln,
            mode: change.type === 'add' ? 'add' : 'remove'
        }
    }

    parse(file: parse.File, options: ParseOptions = {}): VariableMatch[] {
        const results: VariableMatch[] = []

        for (const chunk of file.chunks) {
            const { added: addedChunk, removed: removedChunk } = this.splitChunks(chunk)
            const addedMatches = this.getAllMatches(addedChunk.content, options)
            const removedMatches = this.getAllMatches(removedChunk.content, options)

            /**
             * Given a match index, find the associated change object using the character range
             */
            const formatMatches = (matches: Match[], { changes }: Chunk) => {
                matches.forEach((match) => {
                    const change = changes.find(({ range }) => (
                        match.index >= range.start && match.index < range.end
                    ))?.change
                    if (change) {
                        results.push(this.formatMatch(match.name, file, change))
                    }
                })
            }

            formatMatches(addedMatches, addedChunk)
            formatMatches(removedMatches, removedChunk)
        }
        return results
    }
}
