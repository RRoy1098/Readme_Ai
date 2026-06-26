// src/routes/repository.routes.js
import express from 'express';
import { analyzeRepository, getRepositoryById, listUserRepositories } from '../controllers/repository.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/analyze', analyzeRepository);
router.get('/', listUserRepositories);
router.get('/:id', getRepositoryById);

export default router;