// src/services/pipeline.js
import { cloneRepository } from './clone.js';
import { parseRepository } from './parser.js';
import { extractMetadata } from './metadata.js';
import { chunkSourceCode } from './chunk.js';
import { generateEmbedding } from './embedding.js';
import { storeEmbeddings } from './vector.js';
import Repository from '../models/Repository.js';
import fs from 'fs-extra';
import pLimit from 'p-limit';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Runs the full analysis pipeline for a repository.
 * The repository document should already exist (with a "processing" state).
 * This function updates it with parsed data and indexes its chunks.
 *
 * @param {string} githubUrl - The GitHub URL to analyze.
 * @param {string} userId - The ID of the user who owns this analysis.
 * @returns {Promise<Object>} The updated repository document.
 */
export async function runAnalysisPipeline(githubUrl, userId) {
  let temporaryDiskPath = '';

  try {
    // 1. Create the repository document immediately so we have an ID
    console.log(`[Pipeline] Step 0: Creating repository record for ${githubUrl}...`);
    const repositoryDoc = await Repository.create({
      githubUrl,
      name: 'Processing...',
      owner: 'Processing...',
      user: userId,
      language: 'Detecting...',
      framework: 'Detecting...',
      database: 'Detecting...',
      packageManager: 'Detecting...',
      dependencies: [],
      statistics: { files: 0, folders: 0, linesOfCode: 0 },
      folderTree: [],
    });

    // 2. Shallow Clone Repository
    console.log(`[Pipeline] Step 1: Cloning repository from ${githubUrl}...`);
    const cloneProfile = await cloneRepository(githubUrl);
    temporaryDiskPath = cloneProfile.targetPath;

    // 3. Traversal and Content Extraction
    console.log('[Pipeline] Step 2: Parsing directory structure...');
    const parsedWorkspace = await parseRepository(temporaryDiskPath);

    // 4. Technical Stack Discovery
    console.log('[Pipeline] Step 3: Extracting metadata...');
    const techStackMeta = extractMetadata(parsedWorkspace.files);

    // 5. Update the repository document with real metadata
    console.log('[Pipeline] Step 4: Updating repository record in MongoDB...');
    repositoryDoc.name = cloneProfile.name;
    repositoryDoc.owner = cloneProfile.owner;
    repositoryDoc.language = techStackMeta.language;
    repositoryDoc.framework = techStackMeta.framework;
    repositoryDoc.database = techStackMeta.database;
    repositoryDoc.packageManager = techStackMeta.packageManager;
    repositoryDoc.dependencies = techStackMeta.dependencies;
    repositoryDoc.statistics = {
      files: parsedWorkspace.stats.filesCount,
      folders: parsedWorkspace.stats.foldersCount,
      linesOfCode: parsedWorkspace.stats.linesOfCode,
    };
    repositoryDoc.folderTree = parsedWorkspace.folderTree;
    await repositoryDoc.save();

    // 6. Apply Sliding Window Chunking
    console.log('[Pipeline] Step 5: Chunking source code...');
    const fileSegments = chunkSourceCode(parsedWorkspace.files);

    // 7. Generate Embeddings Concurrently (throttled)
    console.log(`[Pipeline] Step 6: Generating embeddings for ${fileSegments.length} chunks...`);
    const throttle = pLimit(2);

    const embeddingTasks = fileSegments.map((segment, index) =>
      throttle(async () => {
        try {
          if (!segment.chunk || typeof segment.chunk !== 'string' || segment.chunk.trim() === '') {
            console.log(`ℹ️ [Pipeline] Skipping empty chunk: ${segment.filePath}`);
            return null;
          }
          if (index > 0) await delay(150);

          const denseVector = await generateEmbedding(segment.chunk);
          return {
            repositoryId: repositoryDoc._id,
            user: userId,
            filePath: segment.filePath,
            chunk: segment.chunk,
            embedding: denseVector,
            metadata: segment.metadata,
          };
        } catch (err) {
          console.error(`❌ [Embedding Error] ${segment.filePath}: ${err.message}`);
          throw err;
        }
      })
    );

    const rawChunks = await Promise.all(embeddingTasks);
    const validChunks = rawChunks.filter((c) => c !== null);
    console.log(`[Pipeline] Step 6 Complete: ${validChunks.length} embeddings generated.`);

    // 8. Store in MongoDB Atlas Vector Search
    console.log('[Pipeline] Step 7: Storing embeddings in Atlas Vector Search...');
    await storeEmbeddings(validChunks);

    console.log(`[Pipeline] ✓ Finished for: ${repositoryDoc.name} [ID: ${repositoryDoc._id}]`);
    return repositoryDoc;
  } catch (error) {
    console.error(`❌ [Pipeline Error] ${error.message}`);
    throw error;
  } finally {
    // 9. Cleanup
    if (temporaryDiskPath) {
      console.log(`[Pipeline] Cleanup: Removing temporary directory ${temporaryDiskPath}...`);
      await fs.remove(temporaryDiskPath).catch((err) => {
        console.error(`⚠️ Cleanup warning: ${err.message}`);
      });
    }
  }
}
