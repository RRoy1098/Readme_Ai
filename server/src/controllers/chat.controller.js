// src/controllers/chat.controller.js
import { buildRAGContext } from '../services/rag.js';
import { buildChatPrompt } from '../utils/promptBuilder.js';
import { getAiResponse } from '../services/gemini.js';
import Repository from '../models/Repository.js';

/**
 * Answers user questions about a repository using RAG + Gemini.
 * POST /api/chat
 */
export const askQuestion = async (req, res) => {
  const { repositoryId, question } = req.body;
  const userId = req.user._id;

  if (!repositoryId || !question) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Both repositoryId and question properties are required in the request body.',
    });
  }

  try {
    // Verify the repository belongs to this user
    const repo = await Repository.findOne({ _id: repositoryId, user: userId });
    if (!repo) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Repository not found or does not belong to you.',
      });
    }

    console.log(`[Controller] Processing query for repository ${repositoryId}: "${question.substring(0, 60)}..."`);

    const { contextString, repository } = await buildRAGContext(repositoryId, question, 8);
    const formattedPrompt = buildChatPrompt(question, contextString);

    console.log('[Controller] Dispatching question to Gemini...');
    const answer = await getAiResponse(formattedPrompt);

    return res.status(200).json({
      success: true,
      data: {
        question,
        answer,
        repositoryId,
        repositoryName: repository.name,
        contextChunksUsed: 8,
      },
    });
  } catch (error) {
    console.error(`[Controller Error] Chat query failed: ${error.message}`);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process your question.',
      details: error.message,
    });
  }
};
