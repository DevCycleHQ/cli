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
        let files = ''
        if (
            codeInsightsConfig?.includeFiles ||
            codeInsightsConfig?.excludeFiles ||
            flags.include ||
            flags.exclude
        ) {
            files = ' ' + getFilteredFiles(flags, codeInsightsConfig).join(' ')
        }

        execSync(`git diff ${diffCommand}${files} > diff.txt`, {
            stdio: 'ignore',
        })
        return parse(readFileSync('diff.txt', 'utf8'))
    } finally {
        execSync('rm diff.txt', { stdio: 'ignore' })
    }
}
