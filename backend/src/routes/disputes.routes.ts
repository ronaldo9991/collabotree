import { Router } from 'express';
import { 
  createDispute, 
  getDisputes, 
  getDispute, 
  updateDisputeStatus 
} from '../controllers/disputes.controller.js';
import { authenticateToken, requireAuth } from '../middleware/auth.js';
import { requireRole } from '../utils/guards.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);
router.use(requireAuth);

router.post('/', asyncHandler(createDispute));
router.get('/', asyncHandler(getDisputes));
router.get('/:id', asyncHandler(getDispute));

// Admin-only routes
router.patch('/:id/status', requireRole('ADMIN'), asyncHandler(updateDisputeStatus));

export default router;
