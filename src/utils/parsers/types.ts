export type VariableMatch = {
    name: string,
    line: number,
    fileName: string,
    isUnknown?: boolean,
    alias?: string
}

export type VariableUsageMatch = VariableMatch & {
    content: string
    bufferedContent: string
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

export type MultilineUsageChunk = MultilineChunk & {
    start: number
    end: number
}

export type ParseOptions = {
    clientNames?: string[],
    matchPatterns?: Record<string, string[]>,
    printPatterns?: boolean
}

