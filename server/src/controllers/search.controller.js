// src/controllers/search.controller.js
import { generateEmbedding } from '../services/embedding.js';
import { vectorSearch } from '../services/vector.js';
import Repository from '../models/Repository.js';

/**
 * Performs semantic search across a repository's code chunks.
 * POST /api/search
 */
export const semanticSearch = async (req, res) => {
  const { repositoryId, query } = req.body;
  const userId = req.user._id;

  if (!repositoryId || !query) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Both repositoryId and query properties are required in the request body.',
    });
  }

  try {
    // Verify the repository belongs to this user
    const repository = await Repository.findOne({ _id: repositoryId, user: userId });
    if (!repository) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Repository not found or does not belong to you.',
      });
    }

    console.log(`[Controller] Semantic search in ${repositoryId}: "${query.substring(0, 60)}..."`);

    const queryVector = await generateEmbedding(query);
    const results = await vectorSearch(repositoryId, queryVector, 10);

    const formattedResults = results.map((item, index) => ({
      rank: index + 1,
      filePath: item.filePath,
      score: item.score,
      snippet: item.chunk.substring(0, 500),
      metadata: item.metadata,
      fullLength: item.chunk.length,
    }));

    return res.status(200).json({
      success: true,
      data: {
        query,
        repositoryId,
        repositoryName: repository.name,
        totalResults: formattedResults.length,
        results: formattedResults,
      },
    });
  } catch (error) {
    console.error(`[Controller Error] Semantic search failed: ${error.message}`);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Semantic search failed.',
      details: error.message,
    });
  }
};
