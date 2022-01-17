import { execSync } from 'child_process'
import parse from 'parse-diff'

export const executeDiff = (diffCommand: string) => {
    const result = execSync(`git diff ${diffCommand}`)

    return parse(result.toString())
}
