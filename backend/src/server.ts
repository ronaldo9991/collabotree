import { createServer } from 'http';
import { env } from './config/env.js';
import app from './app.js';
import { initializeSocketIO } from './sockets/index.js';
import { setupChatGateway } from './sockets/chat.gateway.js';
import { initializeDatabase, closeDatabaseConnection, prisma } from './db/connection.js';

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = initializeSocketIO(httpServer);
setupChatGateway(io);

// Railway provides PORT environment variable - always prioritize process.env.PORT
const PORT = process.env.PORT ? parseInt(process.env.PORT) : (env.PORT || 4000);

// Production error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
console.log(`🌐 Starting server on port ${PORT} (from process.env.PORT: ${process.env.PORT})`);
console.log(`🌐 Binding to 0.0.0.0 to accept external connections`);

httpServer.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 CollaboTree Backend Server running on port ${PORT}`);
  console.log(`📡 Environment: ${env.NODE_ENV}`);
  console.log(`🔗 Client Origin: ${env.CLIENT_ORIGIN || 'Same domain'}`);
  console.log(`🔌 Socket.IO: Enabled`);
  console.log(`✅ Server is now listening and ready to accept requests`);
  
  // Initialize database connection
  try {
    console.log('🔄 Initializing database connection...');
    const dbConnected = await initializeDatabase();
    if (dbConnected) {
      console.log(`💾 Database: Connected and initialized successfully`);
      
      // Test a simple database operation to ensure everything works
      try {
        const testResult = await prisma.$queryRaw`SELECT NOW() as current_time`;
        console.log(`✅ Database ready for queries: ${JSON.stringify(testResult)}`);
      } catch (testError) {
        console.error('⚠️ Database test query failed:', testError);
      }
    } else {
      if (env.NODE_ENV === 'production') {
        console.error('❌ Database connection failed in production - this may cause issues');
      } else {
        console.log(`⚠️ Database: Not connected (normal for local development)`);
      }
    }
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    if (env.NODE_ENV === 'production') {
      console.error('🚨 Production database connection failed - app may not function properly');
    } else {
      console.log('⚠️ Backend will start without database connection');
      console.log('💡 This is normal for local development - Railway deployment will work');
    }
  }
  
  if (env.NODE_ENV === 'production') {
    console.log(`🌍 Production mode: Serving frontend + backend`);
  }
});

// Add error handling for server binding
httpServer.on('error', (error: any) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
  } else if (error.code === 'EACCES') {
    console.error(`❌ Permission denied to bind to port ${PORT}`);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(async () => {
    console.log('HTTP server closed');
    await closeDatabaseConnection();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  httpServer.close(async () => {
    console.log('HTTP server closed');
    await closeDatabaseConnection();
    process.exit(0);
  });
});
