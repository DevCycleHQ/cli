import { Range } from '../../utils/parsers/types'

export type File = {
    name: string
    lines: LineItem[]
}

export type LineItem = {
    ln: number
    content: string
}

export type JSONMatch = {
    key: string
    references: VariableReference[]
}

export type VariableReference = {
    codeSnippet: CodeSnippet
    lineNumbers: Range
    fileName: string
    language: string
}

export type CodeSnippet = {
    lineNumbers: Range
    content: string
}
