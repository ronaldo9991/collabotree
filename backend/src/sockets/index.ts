import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { env } from '../config/env.js';

export let io: SocketIOServer;

export const initializeSocketIO = (httpServer: HttpServer) => {
  // For Railway single deployment, allow all origins in production or use CLIENT_ORIGIN if set
  const corsOrigin = env.NODE_ENV === 'production' && !env.CLIENT_ORIGIN
    ? '*'  // Single deployment: allow all
    : env.CLIENT_ORIGIN || 'http://localhost:3000';

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: corsOrigin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['polling', 'websocket'], // Prioritize polling for Railway compatibility
    allowEIO3: true, // Support older clients
    path: '/socket.io/', // Explicit path
    pingTimeout: 60000, // 60 seconds
    pingInterval: 25000, // 25 seconds
  });

  console.log(`✅ Socket.IO initialized successfully`);
  console.log(`🔗 CORS origin: ${corsOrigin}`);
  console.log(`🚀 Transports: polling, websocket`);
  console.log(`📍 Path: /socket.io/`);
  
  // Log connection events for debugging
  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);
    
    socket.on('disconnect', (reason) => {
      console.log(`❌ Client disconnected: ${socket.id}, reason: ${reason}`);
    });
    
    socket.on('error', (error) => {
      console.error(`❌ Socket error for ${socket.id}:`, error);
    });
  });
  
  return io;
};
