import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../db/prisma.js';
import { JWTPayload } from '../types/auth.js';

interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
    role: string;
  };
}

export const setupChatGateway = (io: SocketIOServer) => {
  // Authentication middleware for Socket.IO
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JWTPayload;
      
      // Verify user still exists
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, role: true }
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = {
        id: user.id,
        role: user.role,
      };

      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.user?.id} connected to chat`);

    // Join chat room for a specific hire request
    socket.on('chat:join', async (data: { hireId: string }) => {
      try {
        const { hireId } = data;

        if (!hireId) {
          socket.emit('error', { message: 'Hire ID is required' });
          return;
        }

        // Verify hire request exists and is accepted
        const hireRequest = await prisma.hireRequest.findUnique({
          where: { id: hireId },
          select: {
            id: true,
            buyerId: true,
            studentId: true,
            status: true,
            chatRoom: {
              select: { id: true }
            }
          }
        });

        if (!hireRequest) {
          socket.emit('error', { message: 'Hire request not found' });
          return;
        }

        if (hireRequest.status !== 'ACCEPTED') {
          socket.emit('error', { message: 'Chat is only available for accepted hire requests' });
          return;
        }

        // Check if user is a participant
        if (hireRequest.buyerId !== socket.user!.id && 
            hireRequest.studentId !== socket.user!.id && 
            socket.user!.role !== 'ADMIN') {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        // Create chat room if it doesn't exist
        let chatRoom = hireRequest.chatRoom;
        if (!chatRoom) {
          chatRoom = await prisma.chatRoom.create({
            data: { hireRequestId: hireId },
            select: { id: true }
          });
        }

        // Join the room
        const roomName = `hire:${hireId}`;
        socket.join(roomName);
        
        socket.emit('chat:joined', { 
          hireId, 
          roomName,
          message: 'Successfully joined chat room' 
        });

        console.log(`User ${socket.user!.id} joined room ${roomName}`);
      } catch (error) {
        console.error('Error joining chat room:', error);
        socket.emit('error', { message: 'Failed to join chat room' });
      }
    });

    // Send message
    socket.on('chat:message:send', async (data: { hireId: string; body: string }) => {
      try {
        const { hireId, body } = data;

        if (!hireId || !body?.trim()) {
          socket.emit('error', { message: 'Hire ID and message body are required' });
          return;
        }

        if (body.length > 2000) {
          socket.emit('error', { message: 'Message is too long (max 2000 characters)' });
          return;
        }

        // Verify hire request exists and is accepted
        const hireRequest = await prisma.hireRequest.findUnique({
          where: { id: hireId },
          select: {
            id: true,
            buyerId: true,
            studentId: true,
            status: true,
            chatRoom: {
              select: { id: true }
            }
          }
        });

        if (!hireRequest) {
          socket.emit('error', { message: 'Hire request not found' });
          return;
        }

        if (hireRequest.status !== 'ACCEPTED') {
          socket.emit('error', { message: 'Chat is only available for accepted hire requests' });
          return;
        }

        // Check if user is a participant
        if (hireRequest.buyerId !== socket.user!.id && 
            hireRequest.studentId !== socket.user!.id && 
            socket.user!.role !== 'ADMIN') {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        // Create chat room if it doesn't exist
        let chatRoom = hireRequest.chatRoom;
        if (!chatRoom) {
          chatRoom = await prisma.chatRoom.create({
            data: { hireRequestId: hireId },
            select: { id: true }
          });
        }

        // Create message
        const message = await prisma.message.create({
          data: {
            roomId: chatRoom.id,
            senderId: socket.user!.id,
            body: body.trim(),
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
            readBy: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        });

        // Emit message to all users in the room
        const roomName = `hire:${hireId}`;
        io.to(roomName).emit('chat:message:new', {
          id: message.id,
          body: message.body,
          sender: message.sender,
          createdAt: message.createdAt,
          readBy: message.readBy.map(r => ({
            userId: r.user.id,
            userName: r.user.name,
            readAt: r.readAt,
          })),
        });

        console.log(`Message sent in room ${roomName} by user ${socket.user!.id}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Mark message as read
    socket.on('chat:message:read', async (data: { hireId: string; messageId: string }) => {
      try {
        const { hireId, messageId } = data;

        if (!hireId || !messageId) {
          socket.emit('error', { message: 'Hire ID and message ID are required' });
          return;
        }

        // Verify hire request exists and is accepted
        const hireRequest = await prisma.hireRequest.findUnique({
          where: { id: hireId },
          select: {
            id: true,
            buyerId: true,
            studentId: true,
            status: true,
            chatRoom: {
              select: { id: true }
            }
          }
        });

        if (!hireRequest) {
          socket.emit('error', { message: 'Hire request not found' });
          return;
        }

        if (hireRequest.status !== 'ACCEPTED') {
          socket.emit('error', { message: 'Chat is only available for accepted hire requests' });
          return;
        }

        // Check if user is a participant
        if (hireRequest.buyerId !== socket.user!.id && 
            hireRequest.studentId !== socket.user!.id && 
            socket.user!.role !== 'ADMIN') {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        if (!hireRequest.chatRoom) {
          socket.emit('error', { message: 'Chat room not found' });
          return;
        }

        // Check if message exists and user hasn't read it yet
        const message = await prisma.message.findFirst({
          where: {
            id: messageId,
            roomId: hireRequest.chatRoom.id,
            readBy: {
              none: {
                userId: socket.user!.id
              }
            }
          }
        });

        if (message) {
          await prisma.messageRead.create({
            data: {
              messageId,
              userId: socket.user!.id
            }
          });

          // Emit read receipt to all users in the room
          const roomName = `hire:${hireId}`;
          io.to(roomName).emit('chat:message:read', {
            messageId,
            readBy: socket.user!.id,
            readAt: new Date(),
          });
        }
      } catch (error) {
        console.error('Error marking message as read:', error);
        socket.emit('error', { message: 'Failed to mark message as read' });
      }
    });

    // Typing indicator
    socket.on('chat:typing', (data: { hireId: string; isTyping: boolean }) => {
      try {
        const { hireId, isTyping } = data;

        if (!hireId) {
          socket.emit('error', { message: 'Hire ID is required' });
          return;
        }

        const roomName = `hire:${hireId}`;
        
        if (isTyping) {
          socket.to(roomName).emit('chat:typing', {
            userId: socket.user!.id,
            isTyping: true,
          });
        } else {
          socket.to(roomName).emit('chat:typing', {
            userId: socket.user!.id,
            isTyping: false,
          });
        }
      } catch (error) {
        console.error('Error handling typing indicator:', error);
      }
    });

    // Leave chat room
    socket.on('chat:leave', (data: { hireId: string }) => {
      try {
        const { hireId } = data;

        if (!hireId) {
          socket.emit('error', { message: 'Hire ID is required' });
          return;
        }

        const roomName = `hire:${hireId}`;
        socket.leave(roomName);
        
        socket.emit('chat:left', { 
          hireId, 
          message: 'Left chat room' 
        });

        console.log(`User ${socket.user!.id} left room ${roomName}`);
      } catch (error) {
        console.error('Error leaving chat room:', error);
        socket.emit('error', { message: 'Failed to leave chat room' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.user?.id} disconnected from chat`);
    });
  });
};
