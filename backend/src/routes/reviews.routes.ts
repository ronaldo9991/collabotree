import { Router } from 'express';
import { createReview, getReviews, getServiceReviews } from '../controllers/reviews.controller.js';
import { authenticateToken, requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

// Public route - no authentication required
router.get('/services/:serviceId', asyncHandler(getServiceReviews));

// All other routes require authentication
router.use(authenticateToken);
router.use(requireAuth);

router.post('/', asyncHandler(createReview));
router.get('/users/:userId', asyncHandler(getReviews));

export default router;
