import fs from 'fs'
import path from 'path'
import defaultFiles from './defaultFiles'

const typedGlobal = global as {dvcFilesInstance?: DVCFiles}
export default class DVCFiles {
    public static getInstance():DVCFiles {
        // this is the only way I was able to get a consistent singleton across
        // multiple import paths, so that the tests can mock this out
        if(!typedGlobal.dvcFilesInstance) {
            typedGlobal.dvcFilesInstance = new DVCFiles()
        }
        return typedGlobal.dvcFilesInstance
    }

    public static setInstance(instance:DVCFiles) {
        typedGlobal.dvcFilesInstance = instance
    }

    public defineRoot(root: string, filepath: string): void {
        if (path.extname(filepath) === '.yml') {
            this.rootFiles[root] = path.basename(filepath)
            this.rootDirectories[root] = path.dirname(filepath)
        } else {
            this.rootDirectories[root] = filepath
        }
    }

    public saveToFile(root: string, contents: string, filePath?: string): void {
        const fullPath = this.getFullPath(root, filePath || this.rootFiles[root])
        this.guaranteeDirectoryExists(fullPath)
        fs.writeFileSync(fullPath, contents)
    }

    public loadFromFile(root: string, file?: string): string {
        const filePath = file || this.rootFiles[root]
        if (!this.doesFileExist(root, filePath)) {
            return ''
        }
        return fs.readFileSync(this.getFullPath(root, filePath), 'utf8')
    }

    public deleteFile(root: string, file?: string): void {
        const fullPath = this.getFullPath(root, file || this.rootFiles[root])
        if (fs.existsSync(fullPath)) {
            fs.rmSync(fullPath)
        }
    }

    public doesFileExist(root: string, file?: string): boolean {
        return fs.existsSync(this.getFullPath(root, file || this.rootFiles[root]))
    }

    public getFullPath(root: string, file?: string): string {
        if (!this.rootDirectories[root]) {
            throw (new Error(`File root ${root} is not defined`))
        }
        return path.join(this.rootDirectories[root], file || this.rootFiles[root])
    }

    private guaranteeDirectoryExists(filePath: string) {
        const parentDirectory = path.dirname(filePath)
        if (!fs.existsSync(parentDirectory)) {
            fs.mkdirSync(parentDirectory, { recursive: true })
        }
    }

    protected rootFiles: Record<string, string> = { ...defaultFiles }
    protected rootDirectories: Record<string, string> = {}
}