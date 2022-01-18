import parse from 'parse-diff'
import { VariableMatch } from './types'

export abstract class BaseParser {
    abstract identity: string

    formatMatch(name: string, file: parse.File, change: parse.Change): VariableMatch {
        return {
            name,
            fileName: file.to ?? '',
            line: change.type === 'normal' ? change.ln1 : change.ln,
            mode: change.type === 'add' ? 'add' : 'remove'
        }
    }

    abstract match(content: string): string | null

    parse(file: parse.File): VariableMatch[] {
        const results: VariableMatch[] = []
        for (const chunk of file.chunks) {
            for (const change of chunk.changes) {
                const match = this.match(change.content)
                if (match) {
                    results.push(this.formatMatch(match, file, change))
                }
            }
        }
        return results
    }
}
