// src/services/gemini.js
import { GoogleGenAI } from '@google/genai';
import { README_SYSTEM_INSTRUCTION } from '../utils/promptBuilder.js';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY environmental variable is missing from the operational environment.');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

/**
 * Routes structured contextual prompts directly to Gemini 2.5 Flash using system configurations.
 * @param {string} userPromptPayload - The complete prompt returned from buildReadmePrompt().
 * @returns {Promise<string>} The structured markdown string generation output.
 */
export async function getAiResponse(userPromptPayload) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPromptPayload,
      // Pass the system instruction configuration cleanly via config object
      config: {
        systemInstruction: README_SYSTEM_INSTRUCTION,
        temperature: 0.2, // Kept low to enforce strict technical accuracy without creative liberties
      }
    });

    if (!response || !response.text) {
      throw new Error("Empty or structurally broken response received from the Gemini API gateway.");
    }

    return response.text;
  } catch (error) {
    console.error(`[Inference Engine Exception]: Generation failure: ${error.message}`);
    throw error;
  }
}