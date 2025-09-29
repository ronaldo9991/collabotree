import { Router } from 'express';
import { createReview, getReviews } from '../controllers/reviews.controller.js';
import { authenticateToken, requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);
router.use(requireAuth);

router.post('/', asyncHandler(createReview));
router.get('/users/:userId', asyncHandler(getReviews));

export default router;
