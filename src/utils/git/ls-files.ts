import { execSync } from 'node:child_process'

export const lsFiles = (): string[] => {
    const fileBuffer = execSync('git ls-files')
    const files = fileBuffer.toString().split('\n').filter(Boolean)

    return files
}
