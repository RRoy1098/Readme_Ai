import { runAnalysisPipeline } from '../services/pipeline.js';
import Repository from '../models/Repository.js';

/**
 * Analyzes a GitHub repository.
 * POST /api/repository/analyze
 */
export const analyzeRepository = async (req, res) => {
  const { githubUrl } = req.body;
  const userId = req.user._id;

  if (!githubUrl) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'The githubUrl property is required in the request body.',
    });
  }

  try {
    console.log(`[Controller] Starting analysis pipeline for: ${githubUrl}`);

    const repository = await runAnalysisPipeline(githubUrl, userId);

    return res.status(201).json({
      success: true,
      message: 'Repository analysis completed successfully.',
      data: {
        repository: {
          _id: repository._id,
          name: repository.name,
          githubUrl: repository.githubUrl,
          owner: repository.owner,
          language: repository.language,
          framework: repository.framework,
          database: repository.database,
          packageManager: repository.packageManager,
          dependencies: repository.dependencies,
          statistics: repository.statistics,
          folderTree: repository.folderTree,
          createdAt: repository.createdAt,
        },
      },
    });
  } catch (error) {
    console.error(`[Controller Error] Analysis failed: ${error.message}`);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Repository analysis failed.',
      details: error.message,
    });
  }
};

/**
 * Get repository by ID (only if owned by the authenticated user).
 * GET /api/repository/:id
 */
export const getRepositoryById = async (req, res) => {
  try {
    const repo = await Repository.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!repo) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Repository not found or does not belong to you.',
      });
    }

    return res.status(200).json({
      success: true,
      data: repo,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};

/**
 * List all repositories for the authenticated user.
 * GET /api/repository
 */
export const listUserRepositories = async (req, res) => {
  try {
    const repos = await Repository.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('name githubUrl owner language framework statistics createdAt');

    return res.status(200).json({
      success: true,
      data: repos,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
};