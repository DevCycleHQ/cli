import { minimatch } from "minimatch";
import { lsFiles } from "./git/ls-files";
import { CodeInsights } from "../types";

const fileMatchesGlobs = (filepath: string, globs: string[]) => {
  const matchesUnescapedGlobs = globs.some((glob) =>
    minimatch(filepath, glob, { matchBase: true }),
  );
  const matchesEscapedGlobs = globs.some((glob) =>
    minimatch(filepath, minimatch.escape(glob), { matchBase: true }),
  );
  return matchesEscapedGlobs || matchesUnescapedGlobs;
};

export const getFilteredFiles = (
  flags: { include?: string[]; exclude?: string[] },
  codeInsightsConfig?: CodeInsights,
) => {
  const includeFile = (filepath: string) => {
    const includeGlobs = flags["include"] || codeInsightsConfig?.includeFiles;
    return includeGlobs ? fileMatchesGlobs(filepath, includeGlobs) : true;
  };

  const excludeFile = (filepath: string) => {
    const excludeGlobs = flags["exclude"] || codeInsightsConfig?.excludeFiles;
    return excludeGlobs ? fileMatchesGlobs(filepath, excludeGlobs) : false;
  };

  return lsFiles().filter(
    (filepath) => includeFile(filepath) && !excludeFile(filepath),
  );
};
