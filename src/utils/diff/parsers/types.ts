import parse from 'parse-diff'

export type VariableMatch = {
    name: string,
    line: number,
    fileName: string,
    mode: 'add' | 'remove'
}

export type Parser = {
    parse: (files: parse.File) => VariableMatch[],
    identity: string
}
