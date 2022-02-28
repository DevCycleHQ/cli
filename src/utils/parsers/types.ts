export type VariableMatch = {
    name: string,
    line: number,
    fileName: string,
    isUnknown?: boolean,
    alias?: string
}

export type VariableDiffMatch = VariableMatch & {
    mode: 'add' | 'remove',
}

export type ParseOptions = {
    clientNames?: string[],
    matchPatterns?: Record<string, string[]>,
    printPatterns?: boolean
}

