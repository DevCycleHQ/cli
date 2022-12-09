import DVCFiles from './dvcFiles'

export default class MockDVCFiles extends DVCFiles {
    constructor(initialFiles?: Record<string, Record<string, string>>) {
        super()
        this.fileContents = initialFiles || {}
    }
    
    public defineRoot(root: string, path: string): void {
        this.fileContents[root] = this.fileContents[root] || {}
        super.defineRoot(root, path)
    }

    public saveToFile(root: string, contents: string, filePath?: string): void {
        this.fileContents[root][filePath || this.rootFiles[root]] = contents
    }

    public loadFromFile(root: string, file?: string): string {
        return this.fileContents[root][file || this.rootFiles[root]]
    }

    public deleteFile(root: string, file?: string): void {
        delete this.fileContents[root][file || this.rootFiles[root]]
    }

    public doesFileExist(root: string, file?: string): boolean {
        return this.fileContents[root][file || this.rootFiles[root]] !== undefined
    }

    private fileContents: Record<string, Record<string, string>>
}