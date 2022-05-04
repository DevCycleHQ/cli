import { execSync } from 'node:child_process'
import parse from 'parse-diff'
import { readFileSync } from 'fs'

export const executeDiff = (diffCommand: string): parse.File[] => {
    try {
        execSync(`git diff ${diffCommand} > diff.txt`, { stdio: 'ignore' })
        return parse(readFileSync('diff.txt', 'utf8'))
    } finally {
        execSync('rm diff.txt', { stdio: 'ignore' })
    }
}
