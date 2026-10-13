import { NodeParser } from './nodejs'
import { ReactParser } from './react'
import { JavascriptParser } from './javascript'
import { JavaParser } from './java'
import { AndroidParser } from './android'
import { CsharpParser } from './csharp'
import { RubyParser } from './ruby'
import { PythonParser } from './python'
import { GolangParser } from './golang'
import { IosParser } from './ios'
import { PhpParser } from './php'
import { DartParser } from './dart'

export * from './android'
export * from './csharp'
export * from './golang'
export * from './ios'
export * from './java'
export * from './javascript'
export * from './nodejs'
export * from './php'
export * from './python'
export * from './react'
export * from './ruby'
export * from './dart'

export const PARSERS: Record<string, (typeof NodeParser)[]> = {
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
    php: [PhpParser],
    dart: [DartParser],
}

export const LANGUAGE_MAP: Record<string, string> = {
    js: 'javascript',
    jsx: 'jsx',
    ts: 'typescript',
    tsx: 'tsx',
    java: 'java',
    kt: 'kotlin',
    cs: 'csharp',
    rb: 'ruby',
    py: 'python',
    go: 'go',
    swift: 'swift',
    php: 'php',
    dart: 'dart',
}

const SAFE_EXTENSION_PATTERN = /^[a-z0-9]{1,16}$/i

/**
 * Map a file extension to a language, falling back to the extension itself
 * for custom match patterns. Unsafe extensions fall back to 'unknown'.
 */
export const getLanguageForExtension = (extension: string): string => {
    if (LANGUAGE_MAP[extension]) return LANGUAGE_MAP[extension]
    return SAFE_EXTENSION_PATTERN.test(extension)
        ? extension.toLowerCase()
        : 'unknown'
}
