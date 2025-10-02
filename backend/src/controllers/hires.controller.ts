import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { AuthenticatedRequest } from '../types/express.js';
import { sendSuccess, sendCreated, sendValidationError, sendNotFound, sendForbidden } from '../utils/responses.js';
import { parsePagination, createPaginationResult } from '../utils/pagination.js';
import { createNotification, createNotificationForUsers } from '../domain/notifications.js';

// Validation schemas
const createHireRequestSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  message: z.string().optional(),
  priceCents: z.number().int().min(100, 'Price must be at least $1.00').optional(),
});

const updateHireRequestSchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED']),
  message: z.string().optional(),
});

const getHireRequestsSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED']).optional(),
  type: z.enum(['sent', 'received']).optional(),
});

export const createHireRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = createHireRequestSchema.parse(req.body);
    const buyerId = req.user!.id;

    // Check if service exists and is active
    const service = await prisma.service.findUnique({
      where: { 
        id: validatedData.serviceId,
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        ownerId: true,
        priceCents: true,
      },
    });

    if (!service) {
      return sendNotFound(res, 'Service not found or inactive');
    }

    // Check if user is trying to hire themselves
    if (service.ownerId === buyerId) {
      return sendForbidden(res, 'You cannot hire yourself');
    }

    // Check if user already has a pending hire request for this service
    const existingRequest = await prisma.hireRequest.findFirst({
      where: {
        buyerId,
        serviceId: validatedData.serviceId,
        status: 'PENDING',
      },
    });

    if (existingRequest) {
      return sendForbidden(res, 'You already have a pending hire request for this service');
    }

    // Create hire request
    const hireRequest = await prisma.hireRequest.create({
      data: {
        buyerId,
        studentId: service.ownerId,
        serviceId: validatedData.serviceId,
        message: validatedData.message,
        priceCents: validatedData.priceCents || service.priceCents,
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
            priceCents: true,
          },
        },
      },
    });

    // Get buyer name for notification
    const buyer = await prisma.user.findUnique({
      where: { id: buyerId },
      select: { name: true },
    });

    // Create notification for student
    await createNotification(
      service.ownerId,
      'HIRE_REQUESTED', // Correct notification type for new hire request
      'New Hire Request',
      `You have received a new hire request for "${service.title}" from ${buyer?.name || 'Someone'}`
    );

    return sendCreated(res, hireRequest, 'Hire request created successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    throw error;
  }
};

export const getHireRequests = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const query = getHireRequestsSchema.parse(req.query);
    const pagination = parsePagination(query);
    const userId = req.user!.id;

    // Build where clause based on type
    let where: any = {};
    
    if (query.type === 'sent') {
      where.buyerId = userId;
    } else if (query.type === 'received') {
      where.studentId = userId;
    } else {
      // Get both sent and received
      where.OR = [
        { buyerId: userId },
        { studentId: userId },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    // Calculate skip for pagination
    const skip = (pagination.page - 1) * pagination.limit;

    const [hireRequests, total] = await Promise.all([
      prisma.hireRequest.findMany({
        where,
        include: {
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          service: {
            select: {
              id: true,
              title: true,
              priceCents: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: pagination.limit,
        skip: skip,
      }),
      prisma.hireRequest.count({ where }),
    ]);

    const result = createPaginationResult(hireRequests, pagination, total);
    return sendSuccess(res, result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    throw error;
  }
};

export const getHireRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const hireRequest = await prisma.hireRequest.findUnique({
      where: { id },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
            priceCents: true,
          },
        },
        chatRoom: {
          include: {
            messages: {
              include: {
                sender: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    });

    if (!hireRequest) {
      return sendNotFound(res, 'Hire request not found');
    }

    // Check if user is involved in this hire request
    if (hireRequest.buyerId !== userId && hireRequest.studentId !== userId) {
      return sendForbidden(res, 'You can only view your own hire requests');
    }

    return sendSuccess(res, hireRequest);
  } catch (error) {
    throw error;
  }
};

export const updateHireRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateHireRequestSchema.parse(req.body);
    const userId = req.user!.id;

    // Check if hire request exists
    const hireRequest = await prisma.hireRequest.findUnique({
      where: { id },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            priceCents: true,
          },
        },
      },
    });

    if (!hireRequest) {
      return sendNotFound(res, 'Hire request not found');
    }

    // Check permissions
    if (hireRequest.buyerId !== userId && hireRequest.studentId !== userId) {
      return sendForbidden(res, 'You can only update your own hire requests');
    }

    // Only the student can accept/reject, buyer can cancel
    if (validatedData.status === 'ACCEPTED' || validatedData.status === 'REJECTED') {
      if (hireRequest.studentId !== userId) {
        return sendForbidden(res, 'Only the service owner can accept or reject hire requests');
      }
    } else if (validatedData.status === 'CANCELLED') {
      if (hireRequest.buyerId !== userId) {
        return sendForbidden(res, 'Only the buyer can cancel hire requests');
      }
    }

    // Update hire request
    const updated = await prisma.hireRequest.update({
      where: { id },
      data: {
        status: validatedData.status,
        message: validatedData.message,
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
            priceCents: true,
          },
        },
      },
    });

    // If accepted, create contract automatically
    if (validatedData.status === 'ACCEPTED') {
      await prisma.$transaction(async (tx) => {
        // Calculate pricing
        const priceCents = hireRequest.priceCents || hireRequest.service.priceCents;
        const platformFeeCents = Math.round(priceCents * 0.10); // 10% commission
        const studentPayoutCents = priceCents - platformFeeCents;

        // Create contract
        await tx.contract.create({
          data: {
            hireRequestId: id,
            buyerId: hireRequest.buyerId,
            studentId: hireRequest.studentId,
            serviceId: hireRequest.serviceId,
            title: hireRequest.service.title,
            description: `Service: ${hireRequest.service.title}`,
            deliverables: JSON.stringify(['Complete the requested service as described']),
            timeline: 7, // Default 7 days
            priceCents,
            platformFeeCents,
            studentPayoutCents,
            status: 'DRAFT',
          },
        });

        return updated;
      });

      // Create notifications
      await createNotificationForUsers(
        [hireRequest.buyerId, hireRequest.studentId],
        'HIRE_ACCEPTED',
        'Hire Request Accepted',
        `Your hire request for "${hireRequest.service.title}" has been accepted! A contract has been created. Please review and sign the contract to proceed.`
      );
    } else if (validatedData.status === 'REJECTED') {
      // Create notification for buyer
      await createNotification(
        hireRequest.buyerId,
        'HIRE_REJECTED',
        'Hire Request Rejected',
        `Your hire request for "${hireRequest.service.title}" has been rejected.`
      );
    } else if (validatedData.status === 'CANCELLED') {
      // Create notification for student
      await createNotification(
        hireRequest.studentId,
        'HIRE_REJECTED', // Reusing this type for cancellation
        'Hire Request Cancelled',
        `The hire request for "${hireRequest.service.title}" has been cancelled.`
      );
    }

    return sendSuccess(res, updated, 'Hire request updated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    throw error;
  }
};

// Convenience functions for specific actions
export const acceptHireRequest = async (req: AuthenticatedRequest, res: Response) => {
  req.body = { status: 'ACCEPTED' };
  return updateHireRequest(req, res);
};

export const rejectHireRequest = async (req: AuthenticatedRequest, res: Response) => {
  req.body = { status: 'REJECTED' };
  return updateHireRequest(req, res);
};

export const cancelHireRequest = async (req: AuthenticatedRequest, res: Response) => {
  req.body = { status: 'CANCELLED' };
  return updateHireRequest(req, res);
};

export const deleteHireRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if hire request exists
    const hireRequest = await prisma.hireRequest.findUnique({
      where: { id },
    });

    if (!hireRequest) {
      return sendNotFound(res, 'Hire request not found');
    }

    // Check permissions - only buyer can delete
    if (hireRequest.buyerId !== userId) {
      return sendForbidden(res, 'You can only delete your own hire requests');
    }

    // Only allow deletion if status is PENDING
    if (hireRequest.status !== 'PENDING') {
      return sendForbidden(res, 'You can only delete pending hire requests');
    }

    // Delete hire request
    await prisma.hireRequest.delete({
      where: { id },
    });

    return sendSuccess(res, null, 'Hire request deleted successfully');
  } catch (error) {
    throw error;
  }
};