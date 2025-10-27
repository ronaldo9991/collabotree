import { Router } from 'express';
import authRoutes from './auth.routes.js';
import meRoutes from './me.routes.js';
import usersRoutes from './users.routes.js';
import servicesRoutes from './services.routes.js';
import hiresRoutes from './hires.routes.js';
import ordersRoutes from './orders.routes.js';
import contractsRoutes from './contracts.routes.js';
import chatRoutes from './chat.routes.js';
import reviewsRoutes from './reviews.routes.js';
import disputesRoutes from './disputes.routes.js';
import notificationsRoutes from './notifications.routes.js';
import walletRoutes from './wallet.routes.js';
import verificationRoutes from './verification.routes.js';
import adminRoutes from './admin.routes.js';
import contactRoutes from './contact.routes.js';
import testRoutes from './test.routes.js';
import healthRoutes from './health.routes.js';
import { getPublicTopSelectionServices } from '../controllers/admin.controller.js';
import { getPublicServices } from '../controllers/public.services.controller.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'CollaboTree API is running',
    timestamp: new Date().toISOString()
  });
});

// Public routes for homepage (no authentication required)
router.get('/public/top-selections', getPublicTopSelectionServices);
router.get('/public/services', getPublicServices);

// API routes
router.use('/auth', authRoutes);
router.use('/me', meRoutes);
router.use('/users', usersRoutes);
router.use('/services', servicesRoutes);
router.use('/hires', hiresRoutes);
router.use('/orders', ordersRoutes);
router.use('/contracts', contractsRoutes);
router.use('/chat', chatRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/disputes', disputesRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/wallet', walletRoutes);
router.use('/verification', verificationRoutes);
router.use('/admin', adminRoutes);
router.use('/contact', contactRoutes);
router.use('/test', testRoutes);
router.use('/health', healthRoutes);

export default router;
