// src/routes/chat.routes.js
import express from 'express';
import { askQuestion } from '../controllers/chat.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/', askQuestion);

export default router;
