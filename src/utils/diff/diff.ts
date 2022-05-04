import { execSync } from 'node:child_process'
import parse from 'parse-diff'
import { readFileSync } from 'fs'

export const executeDiff = (diffCommand: string): parse.File[] => {
    execSync(`git diff ${diffCommand} > diff.txt`, { stdio: 'ignore' })
    const result = readFileSync('diff.txt', 'utf8')
    execSync('rm diff.txt', { stdio: 'ignore' })
    return parse(result)
}
