import { Router } from 'express';
import { prisma } from '../db/connection.js';

const router = Router();

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    let databaseStatus = 'Not connected';
    
    // Test database connection if DATABASE_URL is available
    if (process.env.DATABASE_URL) {
      try {
        await prisma.$queryRaw`SELECT 1 as test`;
        databaseStatus = 'Connected';
      } catch (dbError) {
        databaseStatus = 'Connection failed';
        console.error('Database health check failed:', dbError);
      }
    }
    
    res.json({
      success: true,
      message: 'CollaboTree Backend is running',
      timestamp: new Date().toISOString(),
      database: databaseStatus,
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      port: process.env.PORT || 4000
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
