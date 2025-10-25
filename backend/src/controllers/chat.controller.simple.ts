import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { AuthenticatedRequest } from '../types/express.js';
import { sendSuccess, sendCreated, sendError, sendValidationError, sendNotFound } from '../utils/responses.js';

// Chat controller for full functionality
export const getMessages = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { hireId } = req.params;
    const userId = req.user!.id;

    console.log('🔍 getMessages called for hireId:', hireId, 'user:', userId);

    // Find the hire request
    const hireRequest = await prisma.hireRequest.findUnique({
      where: { id: hireId },
      include: {
        buyer: {
          select: { id: true, name: true, email: true, role: true }
        },
        student: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });

    if (!hireRequest) {
      return sendNotFound(res, 'Hire request not found');
    }

    // Check if user is a participant in this hire request
    if (hireRequest.buyerId !== userId && hireRequest.studentId !== userId && req.user!.role !== 'ADMIN') {
      return sendError(res, 'Access denied', 403);
    }

    // Get or create chat room
    let chatRoom = await prisma.chatRoom.findUnique({
      where: { hireRequestId: hireId }
    });

    if (!chatRoom) {
      chatRoom = await prisma.chatRoom.create({
        data: { hireRequestId: hireId }
      });
    }

    // Get messages for this chat room
    const messages = await prisma.message.findMany({
      where: { roomId: chatRoom.id },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        readBy: {
          select: {
            id: true,
            userId: true,
            readAt: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    console.log(`✅ Found ${messages.length} messages for hire request ${hireId}`);
    return sendSuccess(res, messages);
  } catch (error) {
    console.error('❌ Error in getMessages:', error);
    return sendError(res, 'Failed to fetch messages', 500);
  }
};

export const getChatRooms = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    console.log('🔍 getChatRooms called for user:', userId);

    // Get all hire requests where user is either buyer or student
    const hireRequests = await prisma.hireRequest.findMany({
      where: {
        OR: [
          { buyerId: userId },
          { studentId: userId }
        ]
      },
      include: {
        buyer: {
          select: { id: true, name: true, email: true, role: true }
        },
        student: {
          select: { id: true, name: true, email: true, role: true }
        },
        service: {
          select: { id: true, title: true, description: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`✅ Found ${hireRequests.length} hire requests for user ${userId}`);
    return sendSuccess(res, hireRequests);
  } catch (error) {
    console.error('❌ Error in getChatRooms:', error);
    return sendError(res, 'Failed to fetch chat rooms', 500);
  }
};

export const getChatMessages = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { hireId } = req.params;
    const userId = req.user!.id;

    console.log('🔍 getChatMessages called for hireId:', hireId, 'user:', userId);

    // Find the hire request
    const hireRequest = await prisma.hireRequest.findUnique({
      where: { id: hireId },
      include: {
        buyer: {
          select: { id: true, name: true, email: true, role: true }
        },
        student: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });

    if (!hireRequest) {
      return sendNotFound(res, 'Hire request not found');
    }

    // Check if user is a participant in this hire request
    if (hireRequest.buyerId !== userId && hireRequest.studentId !== userId && req.user!.role !== 'ADMIN') {
      return sendError(res, 'Access denied', 403);
    }

    // Get or create chat room
    let chatRoom = await prisma.chatRoom.findUnique({
      where: { hireRequestId: hireId }
    });

    if (!chatRoom) {
      chatRoom = await prisma.chatRoom.create({
        data: { hireRequestId: hireId }
      });
    }

    // Get messages for this chat room
    const messages = await prisma.message.findMany({
      where: { roomId: chatRoom.id },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        readBy: {
          select: {
            id: true,
            userId: true,
            readAt: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    console.log(`✅ Found ${messages.length} messages for hire request ${hireId}`);
    return sendSuccess(res, messages);
  } catch (error) {
    console.error('❌ Error in getChatMessages:', error);
    return sendError(res, 'Failed to fetch messages', 500);
  }
};

export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { hireId } = req.params;
    const { body } = req.body;
    const userId = req.user!.id;

    console.log('🔍 sendMessage called for hireId:', hireId, 'user:', userId, 'message:', body);

    if (!body || body.trim().length === 0) {
      return sendError(res, 'Message body is required', 400);
    }

    // Find the hire request
    const hireRequest = await prisma.hireRequest.findUnique({
      where: { id: hireId },
      include: {
        buyer: {
          select: { id: true, name: true, email: true, role: true }
        },
        student: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });

    if (!hireRequest) {
      return sendNotFound(res, 'Hire request not found');
    }

    // Check if user is a participant in this hire request
    if (hireRequest.buyerId !== userId && hireRequest.studentId !== userId && req.user!.role !== 'ADMIN') {
      return sendError(res, 'Access denied', 403);
    }

    // Get or create chat room
    let chatRoom = await prisma.chatRoom.findUnique({
      where: { hireRequestId: hireId }
    });

    if (!chatRoom) {
      chatRoom = await prisma.chatRoom.create({
        data: { hireRequestId: hireId }
      });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        roomId: chatRoom.id,
        senderId: userId,
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

    console.log('✅ Message created successfully:', message.id);
    return sendCreated(res, message, 'Message sent successfully');
  } catch (error) {
    console.error('❌ Error in sendMessage:', error);
    return sendError(res, 'Failed to send message', 500);
  }
};

export const markMessagesAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { hireId } = req.params;
    const userId = req.user!.id;

    console.log('🔍 markMessagesAsRead called for hireId:', hireId, 'user:', userId);

    // Find the hire request
    const hireRequest = await prisma.hireRequest.findUnique({
      where: { id: hireId }
    });

    if (!hireRequest) {
      return sendNotFound(res, 'Hire request not found');
    }

    // Check if user is a participant in this hire request
    if (hireRequest.buyerId !== userId && hireRequest.studentId !== userId && req.user!.role !== 'ADMIN') {
      return sendError(res, 'Access denied', 403);
    }

    // Get chat room
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { hireRequestId: hireId }
    });

    if (!chatRoom) {
      return sendNotFound(res, 'Chat room not found');
    }

    // Get unread messages for this user
    const unreadMessages = await prisma.message.findMany({
      where: {
        roomId: chatRoom.id,
        senderId: { not: userId }, // Don't mark own messages as read
        readBy: {
          none: { userId: userId }
        }
      }
    });

    // Mark messages as read
    for (const message of unreadMessages) {
      await prisma.messageRead.upsert({
        where: {
          messageId_userId: {
            messageId: message.id,
            userId: userId
          }
        },
        update: {
          readAt: new Date()
        },
        create: {
          messageId: message.id,
          userId: userId,
          readAt: new Date()
        }
      });
    }

    console.log(`✅ Marked ${unreadMessages.length} messages as read for user ${userId}`);
    return sendSuccess(res, { markedAsRead: unreadMessages.length }, 'Messages marked as read');
  } catch (error) {
    console.error('❌ Error in markMessagesAsRead:', error);
    return sendError(res, 'Failed to mark messages as read', 500);
  }
};
