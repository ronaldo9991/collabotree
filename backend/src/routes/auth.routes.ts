import { Router } from 'express';
import { register, login, refresh, logout } from '../controllers/auth.controller.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

// Apply rate limiting to all auth routes
router.use(authLimiter);

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/refresh', asyncHandler(refresh));
router.post('/logout', asyncHandler(logout));

export default router;
