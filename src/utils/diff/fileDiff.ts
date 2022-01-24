import parse from 'parse-diff'
import * as fs from 'node:fs'

export const executeFileDiff = (filePath: string): parse.File[] => {
    const result = fs.readFileSync(filePath, 'utf8')

    return parse(result)
}
