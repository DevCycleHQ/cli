import { execSync } from 'node:child_process'
import parse from 'parse-diff'

export const executeDiff = (diffCommand: string): parse.File[] => {
    const result = execSync(`git diff ${diffCommand}`)

    return parse(result.toString())
}
