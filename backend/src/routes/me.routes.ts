import { Router } from 'express';
import { getProfile, updateProfile, changePassword } from '../controllers/me.controller.js';
import { authenticateToken, requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);
router.use(requireAuth);

router.get('/', asyncHandler(getProfile));
router.patch('/', asyncHandler(updateProfile));
router.patch('/password', asyncHandler(changePassword));

export default router;
