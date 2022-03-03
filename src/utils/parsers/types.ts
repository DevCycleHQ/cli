export type VariableMatch = {
    name: string,
    line: number,
    fileName: string,
    isUnknown?: boolean,
    alias?: string
}

export type VariableUsageMatch = VariableMatch & {
    lines: Range
    bufferedLines: Range
    content: string
    language: string
}

export type VariableDiffMatch = VariableMatch & {
    mode: 'add' | 'remove',
}

export type Range = {
    start: number
    end: number
}

export type  MultilineChunk = {
    content: string
}

export type ParseOptions = {
    clientNames?: string[],
    matchPatterns?: Record<string, string[]>,
    printPatterns?: boolean
}

