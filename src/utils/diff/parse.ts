import parse from 'parse-diff'
import { AndroidParser, CsharpParser, GolangParser, IosParser, JavaParser,
    JavascriptParser, NodeParser, PhpParser, PythonParser, ReactParser, RubyParser } from './parsers'
import { ParseOptions, VariableMatch } from './parsers/types'
import { CustomParser } from './parsers/custom'

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

    const ALL_PARSERS = { ...PARSERS }

    for (const extension in options.matchPatterns ?? {}) {
        ALL_PARSERS[extension] = [...(ALL_PARSERS[extension] ?? []), CustomParser]
    }

    const printed: Record<string, boolean> = {}

    for (const file of files) {
        const fileExtension = file.to?.split('.').pop() ?? ''
        const Parsers = ALL_PARSERS[fileExtension] || []

        for (const Parser of Parsers) {
            const parser = new Parser(fileExtension, options)

            if (options.printPatterns && !printed[parser.identity]) {
                printed[parser.identity] = true
                parser.printRegexPattern()
            }

            const result = parser.parse(file)
            if (result.length > 0) {
                resultsByLanguage[parser.identity] ??= []
                resultsByLanguage[parser.identity].push(...result)
            }
        }
    }

    return resultsByLanguage
}
