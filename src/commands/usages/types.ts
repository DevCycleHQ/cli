export type File = {
    name: string
    lines: LineItem[]
}

export type LineItem = {
    ln: number
    content: string
}