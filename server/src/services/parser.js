// src/services/parser.js
import fastGlob from 'fast-glob';
import fs from 'fs-extra';
import path from 'path';
import ignore from 'ignore';
import { IGNORED_DIRECTORIES, TARGET_EXTENSIONS } from '../utils/constants.js';

/**
 * Iterates across cloned repository structures to extract clean workspace code data.
 * @param {string} repoPath - Path to local cloned workspace.
 * @returns {Promise<{files: Array<{filePath: string, content: string, lines: number}>, stats: Object, folderTree: Object}>}
 */
export async function parseRepository(repoPath) {
  const ig = ignore().add(IGNORED_DIRECTORIES);
  
  // Dynamic system tracking mapping variables
  const parsedFiles = [];
  let totalLinesOfCode = 0;
  const folderTreeSet = new Set();

  // Recursively fetch structural paths inside target repo profile
  const rawFileEntries = await fastGlob(['**/*'], {
    cwd: repoPath,
    dot: true,
    onlyFiles: true,
    absolute: false
  });

  // Filter against our defined ignore rules and target code extensions
  const validFilePaths = rawFileEntries.filter(filePath => {
    const isIgnored = ig.ignores(filePath);
    const extension = path.extname(filePath).toLowerCase();
    const isValidExtension = TARGET_EXTENSIONS.includes(extension) || filePath.endsWith('package.json');
    return !isIgnored && isValidExtension;
  });

  for (const relativePath of validFilePaths) {
    const fullSystemPath = path.join(repoPath, relativePath);
    const fileContentPayload = await fs.readFile(fullSystemPath, 'utf-8');
    
    const fileLinesCount = fileContentPayload.split('\n').length;
    totalLinesOfCode += fileLinesCount;
    
    // Push tracking paths into tracking node collections
    folderTreeSet.add(path.dirname(relativePath));

    parsedFiles.push({
      filePath: relativePath,
      content: fileContentPayload,
      lines: fileLinesCount
    });
  }

  // Construct operational analytics metrics profile package
  const analysisStats = {
    filesCount: validFilePaths.length,
    foldersCount: folderTreeSet.has('.') ? folderTreeSet.size : folderTreeSet.size + 1,
    linesOfCode: totalLinesOfCode
  };

  return {
    files: parsedFiles,
    stats: analysisStats,
    // Convert directory sets into clean index arrays for database storage hierarchies
    folderTree: Array.from(folderTreeSet) 
  };
}