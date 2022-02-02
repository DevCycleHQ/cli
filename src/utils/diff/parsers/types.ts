export type VariableMatch = {
    name: string,
    line: number,
    fileName: string,
    mode: 'add' | 'remove',
    isUnknown?: boolean
}

export type ParseOptions = {
    clientNames?: string[],
    matchPatterns?: Record<string, string[]>
}

