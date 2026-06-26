// src/routes/readme.routes.js
import express from 'express';
import {
  generateReadme,
  getReadmeByRepositoryId,
  listUserReadmes,
  downloadReadme,
} from '../controllers/readme.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', listUserReadmes);
router.post('/generate', generateReadme);
router.get('/:repositoryId/download', downloadReadme);
router.get('/:repositoryId', getReadmeByRepositoryId);

export default router;
