import * as fs from 'fs'

export default {
    writeFileSync(filePath: string, content: string): void {
        return fs.writeFileSync(filePath, content)
    },
    readFileSync(filePath: string, encoding: BufferEncoding = 'utf8'): string {
        return fs.readFileSync(filePath, encoding)
    },
    existsSync(filePath: string): boolean {
        return fs.existsSync(filePath)
    },
}
