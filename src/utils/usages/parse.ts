import { PARSERS } from '../parsers'
import { ParseOptions, VariableUsageMatch } from '../parsers/types'
import { CustomParser } from '../parsers/custom'
import { File } from '../../commands/usages/types'

export const parseFiles = (files: File[], options: ParseOptions = {}): Record<string, VariableUsageMatch[]> => {
    const resultsByLanguage: Record<string, VariableUsageMatch[]> = {}

    const ALL_PARSERS = { ...PARSERS }

    for (const extension in options.matchPatterns ?? {}) {
        ALL_PARSERS[extension] = [...(ALL_PARSERS[extension] ?? []), CustomParser]
    }

    const printed: Record<string, boolean> = {}

    for (const file of files) {
        const fileExtension = file.name?.split('.').pop() ?? ''
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
