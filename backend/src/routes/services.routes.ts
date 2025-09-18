import { Router } from 'express';
import { createService, getServices, getService, updateService, deleteService } from '../controllers/services.controller.js';
import { authenticateToken, requireAuth } from '../middleware/auth.js';
import { requireRole } from '../utils/guards.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

// Public routes
router.get('/', asyncHandler(getServices));
router.get('/:id', asyncHandler(getService));

// Protected routes
router.use(authenticateToken);
router.use(requireAuth);

// Student-only routes
router.post('/', requireRole('STUDENT'), asyncHandler(createService));
router.patch('/:id', requireRole('STUDENT'), asyncHandler(updateService));
router.delete('/:id', requireRole('STUDENT'), asyncHandler(deleteService));

export default router;
