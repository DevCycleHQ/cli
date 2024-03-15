import { execSync } from 'node:child_process'
import parse from 'parse-diff'
import { readFileSync } from 'fs'
import { getFilteredFiles } from '../getFilteredFiles'
import { CodeInsights } from '../../types'

export const executeDiff = (
    diffCommand: string,
    flags: { include?: string[]; exclude?: string[] },
    codeInsightsConfig?: CodeInsights,
): parse.File[] => {
    try {
        let files: string[] = []
        if (
            codeInsightsConfig?.includeFiles ||
            codeInsightsConfig?.excludeFiles ||
            flags.include ||
            flags.exclude
        ) {
            files = getFilteredFiles(flags, codeInsightsConfig)
        }

        const fullCommand = constructFullDiffCommand(diffCommand, files)

        execSync(fullCommand, {
            stdio: 'ignore',
        })
        return parse(readFileSync('diff.txt', 'utf8'))
    } finally {
        execSync('rm diff.txt', { stdio: 'ignore' })
    }
}

export const constructFullDiffCommand = (
    diffCommand: string,
    files: string[],
) => {
    const joinedFiles = files.length ? ' -- "' + files.join('" "') + '"' : ''
    return `git diff ${diffCommand}${joinedFiles} > diff.txt`
}
