import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { sendSuccess, sendCreated, sendError, sendValidationError, sendNotFound } from '../utils/responses.js';
import { createDisputeSchema, updateDisputeStatusSchema, getDisputeSchema, getDisputesSchema } from '../validations/dispute.js';
import { AuthenticatedRequest } from '../types/express.js';
import { parsePagination, createPaginationResult } from '../utils/pagination.js';
import { canCreateDispute } from '../domain/access.js';
import { createNotification, createNotificationForUsers } from '../domain/notifications.js';
// NotificationType removed - using string literals

export const createDispute = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = createDisputeSchema.parse(req.body);

    // Check if user can create a dispute for this order
    const canCreate = await canCreateDispute(req.user!.id, validatedData.orderId);
    if (!canCreate) {
      return sendError(res, 'Cannot create dispute for this order', 403);
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: validatedData.orderId },
      select: {
        id: true,
        buyerId: true,
        studentId: true,
        service: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!order) {
      return sendNotFound(res, 'Order not found');
    }

    const dispute = await prisma.dispute.create({
      data: {
        orderId: validatedData.orderId,
        raisedById: req.user!.id,
        title: validatedData.title,
        description: validatedData.description,
      },
      include: {
        raisedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        order: {
          select: {
            id: true,
            buyerId: true,
            studentId: true,
            service: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    // Create notifications for both parties and admins
    const otherPartyId = order.buyerId === req.user!.id ? order.studentId : order.buyerId;
    
    await createNotificationForUsers(
      [otherPartyId],
      'DISPUTE_RAISED',
      'Dispute Raised',
      `A dispute has been raised for order: "${order.service.title}"`
    );

    // Notify admins (in a real app, you'd get admin users)
    // For now, we'll skip admin notifications

    return sendCreated(res, dispute, 'Dispute created successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    throw error;
  }
};

export const getDisputes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = getDisputesSchema.parse(req.query);
    const pagination = parsePagination(validatedData);

    // Build where clause based on user role
    const where: any = {};

    if (req.user!.role === 'ADMIN') {
      // Admin can see all disputes
    } else {
      // Regular users can only see disputes for their orders
      where.order = {
        OR: [
          { buyerId: req.user!.id },
          { studentId: req.user!.id }
        ]
      };
    }

    if (validatedData.status) {
      where.status = validatedData.status;
    }

    const [disputes, total] = await Promise.all([
      prisma.dispute.findMany({
        where,
        include: {
          raisedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          order: {
            select: {
              id: true,
              buyerId: true,
              studentId: true,
              service: {
                select: {
                  title: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.dispute.count({ where }),
    ]);

    const result = createPaginationResult(disputes, pagination, total);

    return sendSuccess(res, result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    throw error;
  }
};

export const getDispute = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = getDisputeSchema.parse(req.params);

    const dispute = await prisma.dispute.findUnique({
      where: { id: validatedData.id },
      include: {
        raisedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        order: {
          select: {
            id: true,
            buyerId: true,
            studentId: true,
            service: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    if (!dispute) {
      return sendNotFound(res, 'Dispute not found');
    }

    // Check access
    if (req.user!.role !== 'ADMIN' && 
        dispute.order.buyerId !== req.user!.id && 
        dispute.order.studentId !== req.user!.id) {
      return sendError(res, 'Access denied', 403);
    }

    return sendSuccess(res, dispute);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    throw error;
  }
};

export const updateDisputeStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = updateDisputeStatusSchema.parse(req.body);
    const disputeId = req.params.id;

    // Only admins can update dispute status
    if (req.user!.role !== 'ADMIN') {
      return sendError(res, 'Access denied', 403);
    }

    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        order: {
          select: {
            id: true,
            buyerId: true,
            studentId: true,
            service: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    if (!dispute) {
      return sendNotFound(res, 'Dispute not found');
    }

    const updatedDispute = await prisma.dispute.update({
      where: { id: disputeId },
      data: { status: validatedData.status },
      include: {
        raisedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        order: {
          select: {
            id: true,
            buyerId: true,
            studentId: true,
            service: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    // Create notifications for both parties
    await createNotificationForUsers(
      [dispute.order.buyerId, dispute.order.studentId],
      'DISPUTE_RESOLVED',
      'Dispute Status Updated',
      `Dispute for "${dispute.order.service.title}" status changed to ${validatedData.status}`
    );

    return sendSuccess(res, updatedDispute, 'Dispute status updated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    throw error;
  }
};
