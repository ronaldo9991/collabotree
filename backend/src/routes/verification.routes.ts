import { Router } from 'express';
import { VerificationController } from '../controllers/verification.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Student routes
router.post('/upload-id-card', VerificationController.uploadIdCard);
router.get('/status', VerificationController.getVerificationStatus);

// Admin routes
router.post('/verify/:studentId', VerificationController.verifyStudent);
router.get('/pending', VerificationController.getPendingVerifications);

export default router;
