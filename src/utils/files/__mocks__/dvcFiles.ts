export default class MockDVCFiles {
    constructor(initialFiles?: Record<string, Record<string, string>>) {
        this.fileContents = initialFiles || {}
    }
    public defineRoot(root: string, _path: string): void {
        this.fileContents[root] = {}
    }

    public saveToFile(root: string, contents: string, filePath?: string): void {
        this.fileContents[root][filePath || this.defaultFiles[root]] = contents
    }

    public loadFromFile(root: string, file?: string): string {
        return this.fileContents[root][file || this.defaultFiles[root]]
    }

    public deleteFile(root: string, file?: string): void {
        delete this.fileContents[root][file || this.defaultFiles[root]]
    }

    public doesFileExist(root: string, file?: string): boolean {
        return this.fileContents[root][file || this.defaultFiles[root]] !== undefined
    }

    public getFullPath(root: string, file?: string): string {
        return `./${root}/${file || this.defaultFiles[root]}`
    }

    private defaultFiles: Record<string, string> = {
        auth: 'auth.yml',
        user: 'user.yml',
        repo: 'config.yml'
    }

    private fileContents: Record<string, Record<string, string>>
}