import { Router } from 'express';
import { prisma } from '../db/prisma.js';

const router = Router();

// Simple test endpoint
router.get('/test', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1 as test`;
    
    res.json({
      success: true,
      message: 'Backend is working correctly',
      timestamp: new Date().toISOString(),
      database: 'Connected',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Backend test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
