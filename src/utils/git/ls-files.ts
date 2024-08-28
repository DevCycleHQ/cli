import { execSync } from 'node:child_process'

export const lsFiles = (): string[] => {
    // --others & --exclude-standard: get untracked files that are not ignored
    // --cached: get files that are staged
    const fileBuffer = execSync(
        'git ls-files --others --cached --exclude-standard ',
        { maxBuffer: 1024 * 1024 * 10 }, // 10 MB buffer
    )
    const files = fileBuffer.toString().split('\n').filter(Boolean)

    return files
}
