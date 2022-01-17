import parse from 'parse-diff'

export type Parser = {
    parse: (files: parse.File) => string[],
    identity: string
}
