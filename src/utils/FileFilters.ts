import { minimatch } from 'minimatch'
import { lsFiles } from './git/ls-files'
import { CodeInsights } from '../types'

const fileMatchesGlobs = (filepath: string, globs: string[]) => {
    const matchesUnescapedGlobs = globs.some((glob) =>
        minimatch(filepath, glob, { matchBase: true }),
    )
    const matchesEscapedGlobs = globs.some((glob) =>
        minimatch(filepath, minimatch.escape(glob), { matchBase: true }),
    )
    return matchesEscapedGlobs || matchesUnescapedGlobs
}

export class FileFilters {
    flags: { include?: string[]; exclude?: string[] }
    config: CodeInsights

    constructor(
        flags?: FileFilters["flags"],
        codeInsightsConfig?: CodeInsights
    ) {
        this.flags = flags ?? {}
        this.config = codeInsightsConfig ?? {}
    }

    private includeFile(filepath: string) {
        const includeGlobs = this.flags['include'] || this.config.includeFiles
        return includeGlobs ? fileMatchesGlobs(filepath, includeGlobs) : true
    }

    private excludeFile(filepath: string) {
        const excludeGlobs = this.flags['exclude'] || this.config.excludeFiles
        return excludeGlobs ? fileMatchesGlobs(filepath, excludeGlobs) : false
    }

    getFiles() {
        return lsFiles().filter(this.shouldIncludeFile.bind(this))
    }

    shouldIncludeFile(filepath: string) {
        return this.includeFile(filepath) && !this.excludeFile(filepath)
    }
}
