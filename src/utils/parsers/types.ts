export type VariableMatch = {
    name: string,
    line: number,
    fileName: string,
    mode: 'add' | 'remove',
    isUnknown?: boolean,
    alias?: string
}

export type FileMatch = {
    fileName: string,
    line: number,
    variableName: string,
}

export type ParseOptions = {
    clientNames?: string[],
    matchPatterns?: Record<string, string[]>,
    printPatterns?: boolean
}

