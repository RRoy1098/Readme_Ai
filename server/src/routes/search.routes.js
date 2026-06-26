// src/routes/search.routes.js
import express from 'express';
import { semanticSearch } from '../controllers/search.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/', semanticSearch);

export default router;
