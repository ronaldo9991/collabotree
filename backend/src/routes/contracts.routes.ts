import { Router } from 'express';
import { 
  createContract, 
  getContract, 
  signContract, 
  processPayment, 
  updateProgress, 
  markCompleted,
  getUserContracts,
  downloadContractPDF,
  releaseContractPayout
} from '../controllers/contracts.controller.js';
import { authenticateToken, requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);
router.use(requireAuth);

// Contract management routes
router.post('/', asyncHandler(createContract));
router.get('/user', asyncHandler(getUserContracts));
router.get('/:contractId', asyncHandler(getContract));
router.get('/:contractId/pdf', asyncHandler(downloadContractPDF));
router.post('/:contractId/sign', asyncHandler(signContract));
router.post('/:contractId/payment', asyncHandler(processPayment));
router.post('/:contractId/progress', asyncHandler(updateProgress));
router.post('/:contractId/complete', asyncHandler(markCompleted));
router.post('/:contractId/release', asyncHandler(releaseContractPayout));

export default router;

