export type VariableMatch = {
    name: string,
    line: number,
    fileName: string,
    mode: 'add' | 'remove'
}

export type ParseOptions = {
    clientNames?: string[]
}
