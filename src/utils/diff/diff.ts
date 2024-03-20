import { execSync } from 'node:child_process'
import parse from 'parse-diff'
import { readFileSync, rmSync, existsSync } from 'fs'

const TEMP_FILE = 'diff.txt'

export const executeDiff = (
    diffCommand: string,
): parse.File[] => {
    try {
        execSync(`git diff ${diffCommand} > diff.txt`, {
            stdio: 'ignore',
        })
        return parse(readFileSync(TEMP_FILE, 'utf8'))
    } finally {
        if (existsSync(TEMP_FILE)) {
            rmSync(TEMP_FILE)
        }
    }
}
