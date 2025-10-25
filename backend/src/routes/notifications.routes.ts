import { Router } from 'express';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  getUnreadNotificationCount 
} from '../controllers/notifications.controller.js';
import { authenticateToken, requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);
router.use(requireAuth);

router.get('/', asyncHandler(getNotifications));
router.get('/unread-count', asyncHandler(getUnreadNotificationCount));
router.patch('/:id/read', asyncHandler(markNotificationAsRead));
router.patch('/read-all', asyncHandler(markAllNotificationsAsRead));

export default router;
