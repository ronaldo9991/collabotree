import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { sendSuccess, sendError, sendValidationError, sendNotFound } from '../utils/responses.js';
import { getMessagesSchema, markMessagesReadSchema, sendMessageSchema } from '../validations/chat.js';
import { AuthenticatedRequest } from '../types/express.js';
import { createCursorPaginationResult } from '../utils/pagination.js';

export const getMessages = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = getMessagesSchema.parse(req.params);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));

    // Verify hire request exists and is accepted (no contract requirement for chat)
    const hireRequest = await prisma.hireRequest.findUnique({
      where: { id: validatedData.hireId },
      select: {
        id: true,
        buyerId: true,
        studentId: true,
        status: true,
        contract: {
          select: {
            id: true,
            status: true,
            isSignedByBuyer: true,
            isSignedByStudent: true,
            signedAt: true
          }
        },
        chatRoom: {
          select: { id: true }
        }
      }
    });

    if (!hireRequest) {
      return sendNotFound(res, 'Hire request not found');
    }

    if (hireRequest.status !== 'ACCEPTED') {
      return sendError(res, 'Hire request must be accepted first', 403);
    }

    // Chat is available as soon as hire request is accepted - no contract requirement

    // Check if user is a participant
    if (hireRequest.buyerId !== req.user!.id && 
        hireRequest.studentId !== req.user!.id && 
        req.user!.role !== 'ADMIN') {
      return sendError(res, 'Access denied', 403);
    }

    if (!hireRequest.chatRoom) {
      return sendSuccess(res, createCursorPaginationResult([], limit));
    }

    // Build cursor condition
    const cursorCondition = validatedData.cursor ? {
      id: { lt: validatedData.cursor }
    } : {};

    const messages = await prisma.message.findMany({
      where: {
        roomId: hireRequest.chatRoom.id,
        ...cursorCondition,
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
      orderBy: { createdAt: 'asc' }, // Oldest first
      take: limit + 1, // Take one extra to check if there are more
    });

    const hasMore = messages.length > limit;
    const result = hasMore ? messages.slice(0, limit) : messages;

    return sendSuccess(res, createCursorPaginationResult(result, limit));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    throw error;
  }
};

export const markMessagesAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = markMessagesReadSchema.parse(req.params);

    // Verify hire request exists and is accepted (no contract requirement for chat)
    const hireRequest = await prisma.hireRequest.findUnique({
      where: { id: validatedData.hireId },
      select: {
        id: true,
        buyerId: true,
        studentId: true,
        status: true,
        contract: {
          select: {
            id: true,
            status: true,
            isSignedByBuyer: true,
            isSignedByStudent: true,
            signedAt: true
          }
        },
        chatRoom: {
          select: { id: true }
        }
      }
    });

    if (!hireRequest) {
      return sendNotFound(res, 'Hire request not found');
    }

    if (hireRequest.status !== 'ACCEPTED') {
      return sendError(res, 'Hire request must be accepted first', 403);
    }

    // Chat is available as soon as hire request is accepted - no contract requirement

    // Check if user is a participant
    if (hireRequest.buyerId !== req.user!.id && 
        hireRequest.studentId !== req.user!.id && 
        req.user!.role !== 'ADMIN') {
      return sendError(res, 'Access denied', 403);
    }

    if (!hireRequest.chatRoom) {
      return sendSuccess(res, null, 'No messages to mark as read');
    }

    // Mark all messages in the room as read by this user
    const unreadMessages = await prisma.message.findMany({
      where: {
        roomId: hireRequest.chatRoom.id,
        readBy: {
          none: {
            userId: req.user!.id
          }
        }
      },
      select: { id: true }
    });

    if (unreadMessages.length > 0) {
      await prisma.messageRead.createMany({
        data: unreadMessages.map(msg => ({
          messageId: msg.id,
          userId: req.user!.id
        }))
      });
    }

    return sendSuccess(res, null, 'Messages marked as read');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    throw error;
  }
};

export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = sendMessageSchema.parse({
      ...req.params,
      ...req.body
    });

    // Verify hire request exists and is accepted (no contract requirement for chat)
    const hireRequest = await prisma.hireRequest.findUnique({
      where: { id: validatedData.hireId },
      select: {
        id: true,
        buyerId: true,
        studentId: true,
        status: true,
        contract: {
          select: {
            id: true,
            status: true,
            isSignedByBuyer: true,
            isSignedByStudent: true,
            signedAt: true
          }
        },
        chatRoom: {
          select: { id: true }
        }
      }
    });

    if (!hireRequest) {
      return sendNotFound(res, 'Hire request not found');
    }

    if (hireRequest.status !== 'ACCEPTED') {
      return sendError(res, 'Hire request must be accepted first', 403);
    }

    // Chat is available as soon as hire request is accepted - no contract requirement

    // Check if user is a participant
    if (hireRequest.buyerId !== req.user!.id && 
        hireRequest.studentId !== req.user!.id && 
        req.user!.role !== 'ADMIN') {
      return sendError(res, 'Access denied', 403);
    }

    // Create or get chat room
    let chatRoom = hireRequest.chatRoom;
    if (!chatRoom) {
      chatRoom = await prisma.chatRoom.create({
        data: {
          hireRequestId: hireRequest.id,
        }
      });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        roomId: chatRoom.id,
        senderId: req.user!.id,
        body: validatedData.message,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    return sendSuccess(res, message, 'Message sent successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    throw error;
  }
};
