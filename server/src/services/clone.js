// src/services/clone.js
import simpleGit from 'simple-git';
import path from 'path';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

// Resolve directory paths in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Clones a public GitHub repository using a shallow clone pipeline.
 * @param {string} githubUrl - The full target GitHub repository link.
 * @returns {Promise<{targetPath: string, owner: string, name: string}>}
 */
export async function cloneRepository(githubUrl) {
  // Generate a distinct internal workspace target id for multi-tenant isolation
  const repoWorkspaceId = uuidv4();
  const targetPath = path.resolve(__dirname, '../../repositories', repoWorkspaceId);
  
  await fs.ensureDir(targetPath);
  
  const git = simpleGit();
  
  try {
    // Perform optimal shallow clone (depth = 1)
    await git.clone(githubUrl, targetPath, ['--depth', '1']);
    
    // Parse owner and repository name using standard GitHub regex mapping
    const cleanUrl = githubUrl.replace(/\/$/, ""); // Strip trailing slash
    const match = cleanUrl.match(/github\.com\/([^/]+)\/([^/.]+)/);
    
    const owner = match ? match[1] : 'unknown-owner';
    const name = match ? match[2] : 'unknown-repo';

    return { targetPath, owner, name };
  } catch (error) {
    // Clean up directory immediately if cloning fails midway
    await fs.remove(targetPath).catch(() => {});
    throw new Error(`Git clone operations execution failure: ${error.message}`);
  }
}