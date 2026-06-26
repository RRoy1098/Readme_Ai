// src/models/Chunk.js
import mongoose from 'mongoose';

const ChunkSchema = new mongoose.Schema({
  repositoryId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Repository', 
    required: true,
    index: true // Scopes lookups to this specific repository
  },
  filePath: { 
    type: String, 
    required: true 
  },
  chunk: { 
    type: String, 
    required: true 
  },
  // The 384-dimensional dense vector array sits right here
  embedding: { 
    type: [Number], 
    required: true 
  },
  metadata: {
    language: String,
    startLine: Number,
    endLine: Number
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    index: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model('Chunk', ChunkSchema);