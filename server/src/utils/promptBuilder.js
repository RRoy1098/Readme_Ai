// src/utils/promptBuilder.js

export const README_SYSTEM_INSTRUCTION = `
You are an expert Principal AI Software Architect and technical documentation engineer.
Your task is to analyze the provided code context snippets and metadata to generate an exceptionally professional, exhaustive, and clean production-grade README.md file.

CRITICAL BEHAVIORAL RULES:
1. Rely ONLY on the provided code chunks and metadata text. Do not invent features, APIs, or files.
2. If certain details (like exact environment variables or installation commands) are missing, generate logical, safe industry-standard defaults matching the detected stack, or explicitly state them as placeholder requirements.
3. Absolutely NEVER hallucinate project functionalities, credentials, or third-party connections.
4. Output your response using pure, beautifully structured Markdown syntax. Do not wrap the whole response inside a global markdown code block.
`;

/**
 * Constructs the contextual prompt payload for README generation.
 * @param {string} ragContext - The compiled repository metadata and code snippets.
 * @returns {string} The final user prompt.
 */
export function buildReadmePrompt(ragContext) {
  return `
Please generate a comprehensive, enterprise-level README.md using the following repository context payload:

${ragContext}

The generated README.md MUST rigidly contain the following sections in order:
1.  **Title & Detailed Overview**: A clear project title followed by a functional summary explaining what the platform solves.
2.  **Core Features**: A precise bulleted list detailing the capabilities discovered in the source chunks.
3.  **Tech Stack Table**: A structured markdown table detailing Languages, Frameworks, Databases, and Core Libraries.
4.  **Folder Structure**: A clean text tree outlining the directory hierarchy.
5.  **Installation & Setup Guide**: Clear step-by-step setup commands (e.g., install, dev execution routines).
6.  **Environment Variables Configuration**: A code-block template outlining required keys (e.g., \`.env.example\`).
7.  **API Documentation**: A list detailing discovered endpoints, their HTTP methods, explicit request blocks, and expected response payloads.
8.  **Usage Instructions**: Simple examples showing how to interact with the system endpoints or views.
9.  **Contributing & License**: Clean standard boilerplate sections for project maintainers.

Ensure the output is clean, direct, and formatted in professional Markdown.
`;
}

/**
 * Builds a chat/QA prompt for answering questions about a repository.
 * @param {string} question - The user's question.
 * @param {string} ragContext - The compiled repository context.
 * @returns {string} The formatted chat prompt.
 */
export function buildChatPrompt(question, ragContext) {
  return `
You are an expert software engineer analyzing a repository. Answer the user's question based ONLY on the provided repository context.

=== REPOSITORY CONTEXT ===
${ragContext}

=== USER QUESTION ===
${question}

=== INSTRUCTIONS ===
1. Answer the question using ONLY the information present in the repository context above.
2. If the context does not contain enough information to answer the question fully, state what you know and clearly indicate what information is missing.
3. Include relevant file paths and code references from the context when applicable.
4. Format your answer in clear Markdown with code blocks where appropriate.
5. NEVER make up or hallucinate functionality, APIs, or code structures.
6. If the question is about how something works, trace through the code flow step by step using the context provided.
`;
}

/**
 * Builds a folder summary prompt.
 * @param {string} folderPath - The folder path to summarize.
 * @param {string} ragContext - Compiled context for files in that folder.
 * @returns {string} The formatted folder summary prompt.
 */
export function buildFolderSummaryPrompt(folderPath, ragContext) {
  return `
Analyze the following files from the "${folderPath}" directory of a repository and provide a detailed summary.

=== FOLDER FILES CONTEXT ===
${ragContext}

=== INSTRUCTIONS ===
Generate a structured folder summary with:
1. **Purpose**: What this folder/module is responsible for in the overall architecture.
2. **Key Files**: List the most important files and their roles.
3. **Responsibilities**: What the module handles (business logic, data access, routing, etc.).
4. **Dependencies**: Internal and external dependencies used by this folder.
5. **Related APIs**: If this folder contains controllers or routes, list the exposed endpoints.

Be precise and only use information from the provided context.
`;
}

/**
 * Builds a file explanation prompt.
 * @param {string} filePath - The file path to explain.
 * @param {string} fileContent - The full content of the file.
 * @returns {string} The formatted file explanation prompt.
 */
export function buildFileExplanationPrompt(filePath, fileContent) {
  return `
Explain the following source code file in detail.

=== FILE PATH ===
${filePath}

=== FILE CONTENT ===
\`\`\`
${fileContent.substring(0, 8000)}
\`\`\`

=== INSTRUCTIONS ===
Provide a comprehensive explanation covering:
1. **Purpose**: What this file is responsible for.
2. **Workflow**: How the code executes step by step.
3. **Dependencies**: Imports and external modules used.
4. **Business Logic**: Key algorithms, data transformations, or decision logic.
5. **Possible Improvements**: Suggestions for better error handling, performance, or readability.

Be thorough but concise. Use Markdown formatting with code references.
`;
}