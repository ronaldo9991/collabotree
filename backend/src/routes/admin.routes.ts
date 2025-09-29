import { Router } from 'express';
import { authenticateToken, requireAuth } from '../middleware/auth.js';
import {
  getAllMessages,
  getAdminStats,
  updateTopSelection,
  getTopSelectionServices,
  getAllServices,
  getServiceConversation,
} from '../controllers/admin.controller.js';

const router = Router();

// All admin routes require authentication
router.use(authenticateToken);
router.use(requireAuth);

// Admin dashboard stats
router.get('/stats', getAdminStats);

// Message management
router.get('/messages', getAllMessages);

// Top selection management
router.get('/services/top-selections', getTopSelectionServices);
router.get('/services', getAllServices);
router.patch('/services/top-selection', updateTopSelection);

// Conversation management
router.get('/services/:serviceId/conversation', getServiceConversation);

export default router;
