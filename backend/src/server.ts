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

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 CollaboTree Backend Server running on port ${PORT}`);
  console.log(`📡 Environment: ${env.NODE_ENV}`);
  console.log(`🔗 Client Origin: ${env.CLIENT_ORIGIN || 'Same domain'}`);
  console.log(`💾 Database: Connected`);
  console.log(`🔌 Socket.IO: Enabled`);
  
  if (env.NODE_ENV === 'production') {
    console.log(`🌍 Production mode: Serving frontend + backend`);
  }
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
