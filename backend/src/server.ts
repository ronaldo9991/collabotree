import { createServer } from 'http';
import { env } from './config/env.js';
import app from './app.js';
import { initializeSocketIO } from './sockets/index.js';
import { setupChatGateway } from './sockets/chat.gateway.js';

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = initializeSocketIO(httpServer);
setupChatGateway(io);

// Railway provides PORT environment variable
const PORT = process.env.PORT || env.PORT || 4000;

// Start server - bind to 0.0.0.0 for Railway
httpServer.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 CollaboTree Backend Server running on port ${PORT}`);
  console.log(`📡 Environment: ${env.NODE_ENV}`);
  console.log(`🔗 Client Origin: ${env.CLIENT_ORIGIN || 'Same domain'}`);
  console.log(`💾 Database: Connected`);
  console.log(`🔌 Socket.IO: Enabled`);
  
  if (env.NODE_ENV === 'production') {
    console.log(`🌍 Production mode: Serving frontend + backend`);
    console.log(`🔗 Server URL: http://0.0.0.0:${PORT}`);
    console.log(`📋 Debug endpoint: http://0.0.0.0:${PORT}/debug/frontend`);
  }
  console.log(`${'='.repeat(60)}\n`);
});

// Handle server errors
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
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
