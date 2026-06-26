// src/services/metadata.js
import path from 'path';

/**
 * Parses file inventories to extract framework metadata and technical ecosystem tags.
 * @param {Array<{filePath: string, content: string}>} files - Parsed file objects.
 * @returns {Object} Tech stack and dependencies profile metadata.
 */
export function extractMetadata(files) {
  let language = 'JavaScript';
  let framework = 'Unknown';
  let database = 'Unknown';
  let packageManager = 'npm';
  let dependencies = [];

  // Find the primary package.json file for Node ecosystems
  const packageJsonFile = files.find(f => path.basename(f.filePath) === 'package.json');
  
  if (packageJsonFile) {
    try {
      const pkg = JSON.parse(packageJsonFile.content);
      const combinedDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      dependencies = Object.keys(combinedDeps);

      // Framework Detection Heuristics
      if (dependencies.includes('next')) framework = 'Next.js';
      else if (dependencies.includes('react') && dependencies.includes('express')) framework = 'React + Express';
      else if (dependencies.includes('react')) framework = 'React';
      else if (dependencies.includes('express')) framework = 'Express';
      else if (dependencies.includes('@nestjs/core')) framework = 'NestJS';

      // Database Driver Detection Heuristics
      if (dependencies.includes('mongoose') || dependencies.includes('mongodb')) database = 'MongoDB';
      else if (dependencies.includes('pg') || dependencies.includes('sequelize')) database = 'PostgreSQL';
      else if (dependencies.includes('mysql2') || dependencies.includes('typeorm')) database = 'MySQL';
      else if (dependencies.includes('@prisma/client')) database = 'Prisma Supported';
    } catch (error) {
      // Gracefully handle malformed or empty package.json files
    }
  }

  // Detect Lockfiles to discover the active Package Manager
  const fileNames = files.map(f => path.basename(f.filePath));
  if (fileNames.includes('yarn.lock')) packageManager = 'yarn';
  else if (fileNames.includes('pnpm-lock.yaml')) packageManager = 'pnpm';
  else if (fileNames.includes('bun.lockb')) packageManager = 'bun';

  // Primary Programming Language Detection via extension density mapping
  const extensionCounts = {};
  files.forEach(f => {
    const ext = path.extname(f.filePath).toLowerCase();
    if (ext && ext !== '.json' && ext !== '.md') {
      extensionCounts[ext] = (extensionCounts[ext] || 0) + 1;
    }
  });

  const dominantExtension = Object.keys(extensionCounts).reduce(
    (a, b) => (extensionCounts[a] > extensionCounts[b] ? a : b), 
    ''
  );

  const extensionMap = {
    '.ts': 'TypeScript',
    '.tsx': 'TypeScript (React)',
    '.js': 'JavaScript',
    '.jsx': 'JavaScript (React)',
    '.py': 'Python',
    '.go': 'Go',
    '.rs': 'Rust',
    '.java': 'Java'
  };

  if (dominantExtension && extensionMap[dominantExtension]) {
    language = extensionMap[dominantExtension];
  }

  return { language, framework, database, packageManager, dependencies };
}