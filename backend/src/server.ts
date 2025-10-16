import { createServer } from 'http';
import { env } from './config/env.js';
import app from './app.js';
import { initializeSocketIO } from './sockets/index.js';
import { setupChatGateway } from './sockets/chat.gateway.js';
import { initializeDatabase, closeDatabaseConnection } from './db/connection.js';

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = initializeSocketIO(httpServer);
setupChatGateway(io);

// Railway provides PORT environment variable
const PORT = process.env.PORT || env.PORT || 4000;

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
httpServer.listen(PORT, async () => {
  console.log(`🚀 CollaboTree Backend Server running on port ${PORT}`);
  console.log(`📡 Environment: ${env.NODE_ENV}`);
  console.log(`🔗 Client Origin: ${env.CLIENT_ORIGIN || 'Same domain'}`);
  console.log(`🔌 Socket.IO: Enabled`);
  
  // Initialize database connection
  try {
    const dbConnected = await initializeDatabase();
    if (dbConnected) {
      console.log(`💾 Database: Connected and initialized`);
    } else {
      console.log(`⚠️ Database: Not connected (normal for local development)`);
    }
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    console.log('⚠️ Backend will start without database connection');
    console.log('💡 This is normal for local development - Railway deployment will work');
  }
  
  if (env.NODE_ENV === 'production') {
    console.log(`🌍 Production mode: Serving frontend + backend`);
  }
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
