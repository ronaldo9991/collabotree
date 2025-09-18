import { Router } from 'express';
import { getUserProfile } from '../controllers/users.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/:id', asyncHandler(getUserProfile));

export default router;
