import { Router } from 'express';
import { 
  createHireRequest, 
  getHireRequests, 
  getHireRequest, 
  acceptHireRequest, 
  rejectHireRequest, 
  cancelHireRequest 
} from '../controllers/hires.controller.js';
import { authenticateToken, requireAuth } from '../middleware/auth.js';
import { requireRole } from '../utils/guards.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);
router.use(requireAuth);

// Buyer routes
router.post('/', requireRole('BUYER'), asyncHandler(createHireRequest));
router.get('/mine', asyncHandler(getHireRequests));
router.get('/:id', asyncHandler(getHireRequest));

// Student routes
router.patch('/:id/accept', requireRole('STUDENT'), asyncHandler(acceptHireRequest));
router.patch('/:id/reject', requireRole('STUDENT'), asyncHandler(rejectHireRequest));

// Both buyer and student can cancel
router.patch('/:id/cancel', asyncHandler(cancelHireRequest));

export default router;
