import parse from 'parse-diff'
import { AndroidParser, CsharpParser, GolangParser, IosParser, JavaParser,
    JavascriptParser, NodeParser, PhpParser, PythonParser, ReactParser, RubyParser } from './parsers'
import { ParseOptions, VariableMatch } from './parsers/types'

const PARSERS: Record<string, (typeof NodeParser)[]> = {
    js: [NodeParser, ReactParser, JavascriptParser],
    jsx: [ReactParser, JavascriptParser],
    ts: [NodeParser, ReactParser, JavascriptParser],
    tsx: [ReactParser, JavascriptParser],
    java: [JavaParser, AndroidParser],
    kt: [JavaParser, AndroidParser],
    cs: [CsharpParser],
    rb: [RubyParser],
    py: [PythonParser],
    go: [GolangParser],
    swift: [IosParser],
    php: [PhpParser]
}

export const parseFiles = (files: parse.File[], options: ParseOptions = {}): Record<string, VariableMatch[]> => {
    const resultsByLanguage: Record<string, VariableMatch[]> = {}

    for (const file of files) {
        const fileExtension = file.to?.split('.').pop() ?? ''
        const Parsers = PARSERS[fileExtension] || []
        for (const Parser of Parsers) {
            const parser = new Parser(options)
            const result = parser.parse(file)
            if (result.length > 0) {
                resultsByLanguage[parser.identity] ??= []
                resultsByLanguage[parser.identity].push(...result)
            }
        }
    }

    return resultsByLanguage
}
