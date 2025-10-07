import { env } from './config/env.js';
import app from './app.js';

// Vercel serverless function handler
export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', env.CLIENT_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Use the Express app to handle the request
  return app(req, res);
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  const { createServer } = await import('http');
  const { initializeSocketIO } = await import('./sockets/index.js');
  const { setupChatGateway } = await import('./sockets/chat.gateway.js');

  const httpServer = createServer(app);

  // Initialize Socket.IO for local development
  const io = initializeSocketIO(httpServer);
  setupChatGateway(io);

  const PORT = env.PORT || 4000;

  httpServer.listen(PORT, () => {
    console.log(`🚀 CollaboTree Backend Server running on port ${PORT}`);
    console.log(`📡 Environment: ${env.NODE_ENV}`);
    console.log(`🔗 Client Origin: ${env.CLIENT_ORIGIN}`);
    console.log(`💾 Database: Connected`);
    console.log(`🔌 Socket.IO: Enabled`);
  });
}
