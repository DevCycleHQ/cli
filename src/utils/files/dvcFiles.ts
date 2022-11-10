import fs from 'fs'
import path from 'path'

export default class DVCFiles {
    public defineRoot(root: string, path: string) {
        this.fileRoots[root] = path
    }

    public saveToFile(root: string, contents: string, filePath?: string) {
        const fullPath = this.getFullPath(root, filePath || this.defaultFiles[root])
        this.guaranteeDirectoryExists(fullPath)
        fs.writeFileSync(fullPath, contents)
    }

    public loadFromFile(root: string, file?: string): string {
        const filePath = file || this.defaultFiles[root]
        console.log({
            root,
            filePath,
            file,
            indexFile: this.defaultFiles[root]
        })
        if (!this.doesFileExist(root, filePath)) {
            return ''
        }
        return fs.readFileSync(this.getFullPath(root, filePath), 'utf8')
    }

    public deleteFile(root: string, file?: string): void {
        const fullPath = this.getFullPath(root, file || this.defaultFiles[root])
        if (fs.existsSync(fullPath)) {
            fs.rmSync(fullPath)
        }
    }

    public doesFileExist(root: string, file?: string): boolean {
        return fs.existsSync(this.getFullPath(root, file || this.defaultFiles[root]))
    }

    public getFullPath(root: string, file?: string): string {
        return path.join(this.fileRoots[root], file || this.defaultFiles[root])
    }

    private guaranteeDirectoryExists(filePath: string) {
        const parentDirectory = path.dirname(filePath)
        if (!fs.existsSync(parentDirectory)) {
            fs.mkdirSync(parentDirectory, { recursive: true })
        }
    }

    private defaultFiles:Record<string, string> = {
        auth: 'auth.yml',
        user: 'user.yml',
        repo: 'config.yml'
    }

    private fileRoots: Record<string, string> = {}
}