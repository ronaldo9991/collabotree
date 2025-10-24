import { Router } from 'express';
import { getMessages, markMessagesAsRead, sendMessage } from '../controllers/chat.controller.js';
import { authenticateToken, requireAuth } from '../middleware/auth.js';
import { requireAcceptedHire } from '../middleware/requireAcceptedHire.js';
import { chatLimiter } from '../middleware/rateLimit.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);
router.use(requireAuth);

// Apply rate limiting to chat routes
router.use(chatLimiter);

router.get('/rooms/:hireId/messages', asyncHandler(getMessages));
router.post('/rooms/:hireId/messages', asyncHandler(sendMessage));
router.post('/rooms/:hireId/read', asyncHandler(markMessagesAsRead));

export default router;
