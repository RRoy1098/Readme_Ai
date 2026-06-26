import path from 'path';

/**
 * Parses files and segments them into overlapping context windows based on line counts.
 * @param {Array<{filePath: string, content: string}>} files 
 * @param {number} maxLinesPerChunk - Standard context limit per window frame.
 * @param {number} overlapLinesCount - Line sliding window buffer overlap.
 * @returns {Array<Object>} Structured array of code chunks ready for embeddings.
 */
export function chunkSourceCode(files, maxLinesPerChunk = 60, overlapLinesCount = 15) {
  const codeSegments = [];

  for (const file of files) {
    const extension = path.extname(file.filePath).toLowerCase();
    const lines = file.content.split('\n');
    
    // Skip splitting completely if the source file is tiny
    if (lines.length <= maxLinesPerChunk) {
      codeSegments.push({
        filePath: file.filePath,
        chunk: file.content,
        metadata: {
          startLine: 1,
          endLine: lines.length,
          language: extension.replace('.', '')
        }
      });
      continue;
    }

    let startPointer = 0;
    while (startPointer < lines.length) {
      const endPointer = Math.min(startPointer + maxLinesPerChunk, lines.length);
      const chunkLinesSlice = lines.slice(startPointer, endPointer);
      
      codeSegments.push({
        filePath: file.filePath,
        chunk: chunkLinesSlice.join('\n'),
        metadata: {
          startLine: startPointer + 1,
          endLine: endPointer,
          language: extension.replace('.', '')
        }
      });

      // Advance sliding window forward by line limit offset minus cross-overlap
      startPointer += (maxLinesPerChunk - overlapLinesCount);
    }
  }

  return codeSegments;
}