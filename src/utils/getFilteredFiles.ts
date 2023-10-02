import { minimatch } from 'minimatch'
import { lsFiles } from './git/ls-files'
import {  CodeInsights } from '../types'

export const getFilteredFiles = (
    flags: { include?: string[], exclude?: string[] },
    codeInsightsConfig?: CodeInsights 
) => {
    const includeFile = (
        filepath: string, 
    ) => {
        const includeGlobs = flags['include'] || codeInsightsConfig?.includeFiles
        return includeGlobs
            ? includeGlobs.some((glob) =>
                minimatch(filepath, minimatch.escape(glob), { matchBase: true })
            )
            : true
    }
    
    const excludeFile =  (
        filepath: string, 
    ) => {
        const excludeGlobs = flags['exclude'] || codeInsightsConfig?.excludeFiles
        return excludeGlobs
            ? excludeGlobs.some((glob) => minimatch(filepath, minimatch.escape(glob), { matchBase: true }))
            : false
    }

    return lsFiles().filter((filepath) => includeFile(filepath) && !excludeFile(filepath))

}
