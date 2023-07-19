import * as fs from 'fs'

export default {
    writeFileSync(filePath: string, content: string): void {
        return fs.writeFileSync(filePath, content)
    },
    readFileSync(filePath: string): Buffer {
        return fs.readFileSync(filePath)
    }
}
