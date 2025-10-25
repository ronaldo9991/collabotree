import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/tokens.js';
import { prisma } from '../db/prisma.js';

// Extend Socket interface to include custom properties
interface CustomSocket extends Socket {
  userId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  currentHireId?: string;
}

export class ChatGateway {
  private io: SocketIOServer;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(io: SocketIOServer) {
    this.io = io;
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', async (socket: CustomSocket) => {
      console.log('🔌 Socket connected:', socket.id);

      // Authenticate using the auth handshake data
      try {
        const token = (socket.handshake.auth as any)?.token;
        
        if (!token) {
          console.error('❌ No token provided in handshake');
          socket.emit('error', { message: 'Authentication token required' });
          socket.disconnect();
          return;
        }

        const payload = verifyAccessToken(token);
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: { id: true, name: true, email: true, role: true }
        });

        if (!user) {
          console.error('❌ User not found for token');
          socket.emit('error', { message: 'User not found' });
          socket.disconnect();
          return;
        }

        // Store user connection
        this.connectedUsers.set(user.id, socket.id);
        socket.userId = user.id;
        socket.user = user;

        console.log('✅ User authenticated:', user.name, user.id);
        socket.emit('authenticated', { user });
      } catch (error) {
        console.error('❌ Authentication error:', error);
        socket.emit('error', { message: 'Invalid token' });
        socket.disconnect();
        return;
      }

      // Legacy authenticate event for backwards compatibility
      socket.on('authenticate', async (data) => {
        try {
          const { token } = data;
          if (!token) {
            socket.emit('error', { message: 'Authentication token required' });
            return;
          }

          const payload = verifyAccessToken(token);
          const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { id: true, name: true, email: true, role: true }
          });

          if (!user) {
            socket.emit('error', { message: 'User not found' });
            return;
          }

          // Store user connection
          this.connectedUsers.set(user.id, socket.id);
          socket.userId = user.id;
          socket.user = user;

          console.log('✅ User authenticated via event:', user.name, user.id);
          socket.emit('authenticated', { user });
        } catch (error) {
          console.error('❌ Authentication error:', error);
          socket.emit('error', { message: 'Invalid token' });
        }
      });

      // Handle joining chat room
      socket.on('chat:join', async (data) => {
        try {
          if (!socket.userId) {
            socket.emit('error', { message: 'Authentication required' });
            return;
          }

          const { hireId } = data;
          if (!hireId) {
            socket.emit('error', { message: 'Hire ID required' });
            return;
          }

          // Verify user has access to this hire request
          const hireRequest = await prisma.hireRequest.findUnique({
            where: { id: hireId },
            include: {
              buyer: { select: { id: true, name: true, email: true, role: true } },
              student: { select: { id: true, name: true, email: true, role: true } }
            }
          });

          if (!hireRequest) {
            socket.emit('error', { message: 'Hire request not found' });
            return;
          }

          if (hireRequest.buyerId !== socket.userId && hireRequest.studentId !== socket.userId && socket.user?.role !== 'ADMIN') {
            socket.emit('error', { message: 'Access denied' });
            return;
          }

          // Join the room
          socket.join(`hire:${hireId}`);
          socket.currentHireId = hireId;

          console.log('✅ User joined chat room:', socket.user?.name, 'hire:', hireId);
          socket.emit('chat:joined', { hireId, hireRequest });
        } catch (error) {
          console.error('❌ Join room error:', error);
          socket.emit('error', { message: 'Failed to join room' });
        }
      });

      // Handle sending messages
      socket.on('chat:message:send', async (data) => {
        try {
          if (!socket.userId || !socket.currentHireId) {
            socket.emit('error', { message: 'Authentication and room join required' });
            return;
          }

          const { body } = data;
          if (!body || body.trim().length === 0) {
            socket.emit('error', { message: 'Message body required' });
            return;
          }

          // Get or create chat room
          let chatRoom = await prisma.chatRoom.findUnique({
            where: { hireRequestId: socket.currentHireId }
          });

          if (!chatRoom) {
            chatRoom = await prisma.chatRoom.create({
              data: { hireRequestId: socket.currentHireId }
            });
          }

          // Create message
          const message = await prisma.message.create({
            data: {
              roomId: chatRoom.id,
              senderId: socket.userId,
              body: body.trim()
            },
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true
                }
              }
            }
          });

          console.log('✅ Message sent:', message.id, 'by:', socket.user?.name);

          // Broadcast message to all users in the room
          this.io.to(`hire:${socket.currentHireId}`).emit('chat:message:new', {
            ...message,
            sender: message.sender
          });
        } catch (error) {
          console.error('❌ Send message error:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle typing indicators
      socket.on('chat:typing', (data) => {
        if (socket.currentHireId && socket.userId) {
          socket.to(`hire:${socket.currentHireId}`).emit('chat:typing', {
            userId: socket.userId,
            userName: socket.user?.name,
            isTyping: data.isTyping
          });
        }
      });

      // Handle leaving room
      socket.on('chat:leave', () => {
        if (socket.currentHireId) {
          socket.leave(`hire:${socket.currentHireId}`);
          socket.currentHireId = undefined;
          console.log('👋 User left chat room:', socket.user?.name);
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
          console.log('🔌 Socket disconnected:', socket.user?.name, socket.id);
        }
      });
    });
  }

  // Helper method to send message to specific user
  public sendToUser(userId: string, event: string, data: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  // Helper method to send message to room
  public sendToRoom(hireId: string, event: string, data: any) {
    this.io.to(`hire:${hireId}`).emit(event, data);
  }
}

export const setupChatGateway = (io: SocketIOServer) => {
  return new ChatGateway(io);
};