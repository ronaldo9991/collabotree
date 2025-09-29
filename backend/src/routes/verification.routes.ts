import { Router } from 'express';
import { VerificationController } from '../controllers/verification.controller.js';
import { authenticateToken, requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

// Health check for verification routes
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Verification routes are working',
    timestamp: new Date().toISOString()
  });
});

// All routes require authentication
router.use(authenticateToken);

// Student routes
router.post('/upload-id-card', requireAuth, asyncHandler(VerificationController.uploadIdCard));
router.get('/status', requireAuth, asyncHandler(VerificationController.getVerificationStatus));

// Admin routes
router.post('/verify/:studentId', requireAuth, asyncHandler(VerificationController.verifyStudent));
router.post('/reject/:studentId', requireAuth, asyncHandler(VerificationController.rejectStudent));
router.get('/pending', requireAuth, asyncHandler(VerificationController.getPendingVerifications));

export default router;
