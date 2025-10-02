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

    // Verify hire request exists and has a fully signed contract
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

    // Check if contract exists and is fully signed
    if (!hireRequest.contract) {
      return sendError(res, 'Contract must be created and signed by both parties before chat access', 403);
    }

    if (!hireRequest.contract.isSignedByBuyer || !hireRequest.contract.isSignedByStudent) {
      return sendError(res, 'Both parties must sign the contract before chat access is available', 403);
    }

    if (hireRequest.contract.status !== 'PENDING_SIGNATURES' && hireRequest.contract.status !== 'ACTIVE' && hireRequest.contract.status !== 'COMPLETED') {
      return sendError(res, 'Contract must be active for chat access', 403);
    }

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
        ...cursorCondition
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1
    });

    const hasMore = messages.length > limit;
    const result = hasMore ? messages.slice(0, -1) : messages;
    const nextCursor = hasMore ? result[result.length - 1]?.id : undefined;

    return sendSuccess(res, createCursorPaginationResult(result.reverse(), limit, nextCursor));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    throw error;
  }
};

export const markMessagesAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = markMessagesReadSchema.parse({
      ...req.params,
      ...req.body
    });

    // Verify hire request exists and has a fully signed contract
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
            isSignedByStudent: true
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

    // Check if contract exists and is fully signed
    if (!hireRequest.contract) {
      return sendError(res, 'Contract must be created and signed by both parties before chat access', 403);
    }

    if (!hireRequest.contract.isSignedByBuyer || !hireRequest.contract.isSignedByStudent) {
      return sendError(res, 'Both parties must sign the contract before chat access is available', 403);
    }

    // Check if user is a participant
    if (hireRequest.buyerId !== req.user!.id && 
        hireRequest.studentId !== req.user!.id && 
        req.user!.role !== 'ADMIN') {
      return sendError(res, 'Access denied', 403);
    }

    if (!hireRequest.chatRoom) {
      return sendSuccess(res, { marked: 0 });
    }

    // Mark messages as read
    const result = await prisma.messageRead.upsert({
      where: {
        messageId_userId: {
          messageId: validatedData.messageId,
          userId: req.user!.id
        }
      },
      update: {
        readAt: new Date()
      },
      create: {
        messageId: validatedData.messageId,
        userId: req.user!.id,
        readAt: new Date()
      }
    });

    return sendSuccess(res, { marked: 1 });
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

    // Verify hire request exists and has a fully signed contract
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
            isSignedByStudent: true
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

    // Check if contract exists and is fully signed
    if (!hireRequest.contract) {
      return sendError(res, 'Contract must be created and signed by both parties before chat access', 403);
    }

    if (!hireRequest.contract.isSignedByBuyer || !hireRequest.contract.isSignedByStudent) {
      return sendError(res, 'Both parties must sign the contract before chat access is available', 403);
    }

    if (hireRequest.contract.status !== 'PENDING_SIGNATURES' && hireRequest.contract.status !== 'ACTIVE' && hireRequest.contract.status !== 'COMPLETED') {
      return sendError(res, 'Contract must be active for chat access', 403);
    }

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