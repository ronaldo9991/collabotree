import { Router } from 'express';
import { prisma } from '../db/prisma.js';

const router = Router();

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1 as test`;
    
    res.json({
      success: true,
      message: 'CollaboTree Backend is running',
      timestamp: new Date().toISOString(),
      database: 'Connected',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      version: '1.1.0-hire-chat-fixed',
      features: {
        hireRequests: 'enabled',
        chat: 'enabled-realtime',
        serviceCreation: 'enabled'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Backend health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
