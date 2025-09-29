import { Router } from 'express';
import { getWalletBalance, getWalletEntries } from '../controllers/wallet.controller.js';
import { authenticateToken, requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);
router.use(requireAuth);

router.get('/balance', asyncHandler(getWalletBalance));
router.get('/entries', asyncHandler(getWalletEntries));

export default router;
