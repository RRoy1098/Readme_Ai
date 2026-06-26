// src/server.js
import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle graceful shutdowns for production stability (e.g., Docker/Kubernetes orchestration)
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server safely.');
  server.close(() => {
    console.log('HTTP server closed cleanly.');
    process.exit(0);
  });
});