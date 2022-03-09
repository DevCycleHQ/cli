import { BaseParser, MatchWithRange } from './BaseParser'
import { VariableUsageMatch, Range } from './types'
import * as usage from '../../commands/usages/types'

export abstract class UsageParser extends BaseParser {
    getFilteredFile(file: usage.File) : usage.File {
        const filteredLines = file.lines.filter((line) => {
            for (const commentChar of this.commentCharacters) {
                if (line.content.trim().startsWith(commentChar)) {
                    return false
                }
            }
            return true
        })
        return {
            ...file,
            lines: filteredLines
        }
    }

    extractUsageRange(file: usage.File, match: MatchWithRange): Range {
        const lines: usage.LineItem[] = []
        let index = 0
    
        for (const line of file.lines) {
            const trimmedContent = line.content.trim()
            if (!trimmedContent.length) continue

            const { start: matchStartIndex, end: matchEndIndex } = match.range
            const lineStartIndex = index
            const lineEndIndex = lineStartIndex + trimmedContent.length - 1
            if (
                (matchStartIndex >= lineStartIndex && matchStartIndex <= lineEndIndex)
                || (lineStartIndex >= matchStartIndex && lineStartIndex <= matchEndIndex)
            ) {
                lines.push(line)
            }
            index = lineEndIndex + 1
        }

        return {
            start: lines[0].ln,
            end: lines[lines.length - 1].ln
        }
    }

    parse(file: usage.File): VariableUsageMatch[] {
        const buffer = 3
        const result: VariableUsageMatch[] = []
        const filteredFile = this.getFilteredFile(file)
        let fileContent = ''
        for (const line of filteredFile.lines) {
            fileContent = fileContent.concat(line.content.trim())
        }

        const matches = this.getAllMatches(fileContent)

        for (const match of matches) {
            const range = this.extractUsageRange(filteredFile, match)

            const bufferedStart = Math.max(range.start - buffer, 0)
            const bufferedEnd = Math.min(range.end + buffer, file.lines.length)
            const bufferedContent = file.lines
                .filter((line) => range.start - buffer <= line.ln && range.end + buffer >= line.ln)
                .map((line) => line.content)
                .join('\n')
            
            result.push({
                name: match.name,
                line: range.start,
                lines: range,
                bufferedLines: {
                    start: bufferedStart,
                    end: bufferedEnd
                },
                fileName: file.name,
                content: bufferedContent,
                language: this.identity,
                ...(match.isUnknown ? { isUnknown: true } : {})
            })
        }
        return result
    }
}