import parse from 'parse-diff'
import { ParseOptions, VariableMatch } from './types'

export abstract class BaseParser {
    abstract identity: string
    clientNames: string[]
    abstract variableMethodPattern: RegExp
    abstract variableNameCapturePattern: RegExp

    constructor(protected options: ParseOptions) {
        this.clientNames = options.clientNames ?? ['dvcClient']
    }

    buildRegexPattern() {
        return new RegExp(
            new RegExp(`(?:${this.clientNames.join('|')})`).source
            + this.variableMethodPattern.source
            + this.variableNameCapturePattern.source
        )
    }

    formatMatch(name: string, file: parse.File, change: parse.Change): VariableMatch {
        return {
            name,
            fileName: file.to ?? '',
            line: change.type === 'normal' ? change.ln1 : change.ln,
            mode: change.type === 'add' ? 'add' : 'remove'
        }
    }

    abstract match(content: string, options: ParseOptions): string | null

    parse(file: parse.File, options: ParseOptions = {}): VariableMatch[] {
        const results: VariableMatch[] = []
        for (const chunk of file.chunks) {
            for (const change of chunk.changes) {
                const match = this.match(change.content, options)
                if (match) {
                    results.push(this.formatMatch(match, file, change))
                }
            }
        }
        return results
    }
}
