import parse from 'parse-diff'
import { AndroidParser, CsharpParser, GolangParser, IosParser, JavaParser,
    JavascriptParser, NodeParser, PhpParser, PythonParser, ReactParser, Ruby } from './parsers'
import { VariableMatch } from './parsers/types'
import { BaseParser } from './parsers/common'

const androidParser = new AndroidParser()
const csharpParser = new CsharpParser()
const golangParser = new GolangParser()
const ioParser = new IosParser()
const javaParser = new JavaParser()
const javascriptParser = new JavascriptParser()
const phpParser = new PhpParser()
const pythonParser = new PythonParser()
const reactParser = new ReactParser()
const rubyParser = new Ruby()
const nodeParser = new NodeParser()

const PARSERS: Record<string, BaseParser[]> = {
    js: [nodeParser, reactParser, javascriptParser],
    ts: [nodeParser, reactParser, javascriptParser],
    java: [javaParser, androidParser],
    cs: [csharpParser],
    rb: [rubyParser],
    py: [pythonParser],
    go: [golangParser],
    swift: [ioParser],
    php: [phpParser]
}

export const parseFiles = (files: parse.File[]): Record<string, VariableMatch[]> => {
    const resultsByLanguage: Record<string, VariableMatch[]> = {}

    for (const file of files) {
        const fileExtension = file.to?.split('.').pop() ?? ''
        const parsers = PARSERS[fileExtension] || []
        for (const parser of parsers) {
            const result = parser.parse(file)
            if (result.length > 0) {
                resultsByLanguage[parser.identity] ??= []
                resultsByLanguage[parser.identity].push(...result)
            }
        }
    }

    return resultsByLanguage
}
