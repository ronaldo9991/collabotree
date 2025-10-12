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
    transports: ['websocket', 'polling'],
  });

  console.log(`Socket.IO initialized with CORS origin: ${corsOrigin}`);
  
  return io;
};
