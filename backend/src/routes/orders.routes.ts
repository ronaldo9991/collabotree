import { Router } from 'express';
import { 
  createOrder, 
  getOrders, 
  getOrder, 
  updateOrderStatus, 
  payOrder 
} from '../controllers/orders.controller.js';
import { authenticateToken, requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);
router.use(requireAuth);

router.post('/', asyncHandler(createOrder));
router.get('/mine', asyncHandler(getOrders));
router.get('/:id', asyncHandler(getOrder));
router.patch('/:id/status', asyncHandler(updateOrderStatus));
router.patch('/:id/pay', asyncHandler(payOrder));

export default router;
