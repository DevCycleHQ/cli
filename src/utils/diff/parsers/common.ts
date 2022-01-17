import parse from 'parse-diff'
import { VariableMatch } from './types'

export const formatMatch = (name: string, file: parse.File, change: parse.Change): VariableMatch => {
    return {
        name,
        fileName: file.to ?? '',
        line: change.type === 'normal' ? change.ln1 : change.ln,
        mode: change.type === 'add' ? 'add' : 'remove'
    }
}
