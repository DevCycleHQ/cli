export type MatchKind = 'regular' | 'unknown'
export type VariableMatch = {
    name: string,
    line: number,
    fileName: string,
    mode: 'add' | 'remove',
    kind: MatchKind
}

export type ParseOptions = {
    clientNames?: string[],
    matchPatterns?: Record<string, string[]>
}

