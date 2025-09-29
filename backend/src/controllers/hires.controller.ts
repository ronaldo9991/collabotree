import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { sendSuccess, sendCreated, sendError, sendValidationError, sendNotFound, sendConflict } from '../utils/responses.js';
import { createHireRequestSchema, updateHireRequestSchema, getHireRequestSchema, getHireRequestsSchema } from '../validations/hire.js';
import { AuthenticatedRequest } from '../types/express.js';
import { parsePagination, createPaginationResult } from '../utils/pagination.js';
import { createNotification, createNotificationForUsers } from '../domain/notifications.js';
// NotificationType removed - using string literals

export const createHireRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Debug logging
    console.log('Creating hire request for user:', req.user?.id, 'Role:', req.user?.role);

    const validatedData = createHireRequestSchema.parse(req.body);

    // Check if service exists and is active
    const service = await prisma.service.findUnique({
      where: { id: validatedData.serviceId },
      select: {
        id: true,
        ownerId: true,
        isActive: true,
        title: true,
        priceCents: true
      }
    });

    if (!service || !service.isActive) {
      console.log('Service not found or inactive:', validatedData.serviceId);
      return sendNotFound(res, 'Service not found or inactive');
    }

    // Check if user is trying to hire themselves
    if (service.ownerId === req.user!.id) {
      return sendError(res, 'Cannot hire yourself', 400);
    }

    // Check if user is a buyer
    if (req.user!.role !== 'BUYER') {
      console.log('User role is not buyer:', req.user?.role);
      return sendError(res, 'Only buyers can create hire requests', 403);
    }

    // Check if there's already a pending or accepted hire request for this service
    const existingHireForService = await prisma.hireRequest.findFirst({
      where: {
        buyerId: req.user!.id,
        serviceId: validatedData.serviceId,
        status: { in: ['PENDING', 'ACCEPTED'] }
      }
    });

    if (existingHireForService) {
      return sendConflict(res, 'You already have a pending or accepted hire request for this service');
    }

    // Check if buyer already has a pending or accepted hire request with this student
    const existingHireForStudent = await prisma.hireRequest.findFirst({
      where: {
        buyerId: req.user!.id,
        studentId: service.ownerId,
        status: { in: ['PENDING', 'ACCEPTED'] }
      }
    });

    if (existingHireForStudent) {
      return sendConflict(res, 'You already have a pending or accepted hire request with this student');
    }

    const hireRequest = await prisma.hireRequest.create({
      data: {
        buyerId: req.user!.id,
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
            description: true,
            priceCents: true,
          },
        },
      },
    });

    // Create notification for student
    await createNotification(
      service.ownerId,
      'HIRE_REQUESTED', // Correct notification type for new hire request
      'New Hire Request',
      `You have received a new hire request for "${service.title}" from ${req.user!.name}`
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
    const validatedData = getHireRequestsSchema.parse(req.query);
    const pagination = parsePagination(validatedData);

    // Build where clause based on user role
    const where: any = {};

    if (req.user!.role === 'BUYER') {
      where.buyerId = req.user!.id;
    } else if (req.user!.role === 'STUDENT') {
      where.studentId = req.user!.id;
    } else if (req.user!.role === 'ADMIN') {
      // Admin can see all hire requests
    } else {
      return sendError(res, 'Access denied', 403);
    }

    if (validatedData.status) {
      where.status = validatedData.status;
    }

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
              description: true,
              priceCents: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
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
    const validatedData = getHireRequestSchema.parse(req.params);

    const hireRequest = await prisma.hireRequest.findUnique({
      where: { id: validatedData.id },
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
            description: true,
            priceCents: true,
          },
        },
      },
    });

    if (!hireRequest) {
      return sendNotFound(res, 'Hire request not found');
    }

    // Check access
    if (hireRequest.buyerId !== req.user!.id && 
        hireRequest.studentId !== req.user!.id && 
        req.user!.role !== 'ADMIN') {
      return sendError(res, 'Access denied', 403);
    }

    return sendSuccess(res, hireRequest);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    throw error;
  }
};

export const acceptHireRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const hireId = req.params.id;

    const hireRequest = await prisma.hireRequest.findUnique({
      where: { id: hireId },
      include: {
        service: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!hireRequest) {
      return sendNotFound(res, 'Hire request not found');
    }

    if (hireRequest.studentId !== req.user!.id) {
      return sendError(res, 'Access denied', 403);
    }

    if (hireRequest.status !== 'PENDING') {
      return sendError(res, 'Hire request is not pending', 400);
    }

    // Update hire request status, create chat room, and create order
    const updatedHireRequest = await prisma.$transaction(async (tx) => {
      // Update hire request
      const updated = await tx.hireRequest.update({
        where: { id: hireId },
        data: { status: 'ACCEPTED' },
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
              description: true,
              priceCents: true,
            },
          },
        },
      });

      // Create chat room
      await tx.chatRoom.create({
        data: {
          hireRequestId: hireId,
        },
      });

      // Create order automatically
      await tx.order.create({
        data: {
          buyerId: hireRequest.buyerId,
          studentId: hireRequest.studentId,
          serviceId: hireRequest.serviceId,
          hireRequestId: hireRequest.id,
          priceCents: hireRequest.priceCents || hireRequest.service.priceCents,
          status: 'PENDING',
        },
      });

      return updated;
    });

    // Create notifications
    await createNotificationForUsers(
      [hireRequest.buyerId, hireRequest.studentId],
      'HIRE_ACCEPTED',
      'Hire Request Accepted',
      `Your hire request for "${hireRequest.service.title}" has been accepted! An order has been created automatically.`
    );

    return sendSuccess(res, updatedHireRequest, 'Hire request accepted and order created successfully');
  } catch (error) {
    throw error;
  }
};

export const rejectHireRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const hireId = req.params.id;

    const hireRequest = await prisma.hireRequest.findUnique({
      where: { id: hireId },
      include: {
        service: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!hireRequest) {
      return sendNotFound(res, 'Hire request not found');
    }

    if (hireRequest.studentId !== req.user!.id) {
      return sendError(res, 'Access denied', 403);
    }

    if (hireRequest.status !== 'PENDING') {
      return sendError(res, 'Hire request is not pending', 400);
    }

    const updatedHireRequest = await prisma.hireRequest.update({
      where: { id: hireId },
      data: { status: 'REJECTED' },
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
            description: true,
            priceCents: true,
          },
        },
      },
    });

    // Create notification for buyer
    await createNotification(
      hireRequest.buyerId,
      'HIRE_REJECTED',
      'Hire Request Rejected',
      `Your hire request for "${hireRequest.service.title}" has been rejected`
    );

    return sendSuccess(res, updatedHireRequest, 'Hire request rejected successfully');
  } catch (error) {
    throw error;
  }
};

export const cancelHireRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const hireId = req.params.id;

    const hireRequest = await prisma.hireRequest.findUnique({
      where: { id: hireId },
      include: {
        service: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!hireRequest) {
      return sendNotFound(res, 'Hire request not found');
    }

    // Only buyer or student can cancel, and only if pending
    if ((hireRequest.buyerId !== req.user!.id && hireRequest.studentId !== req.user!.id) || 
        req.user!.role !== 'ADMIN') {
      return sendError(res, 'Access denied', 403);
    }

    if (hireRequest.status !== 'PENDING') {
      return sendError(res, 'Only pending hire requests can be cancelled', 400);
    }

    const updatedHireRequest = await prisma.hireRequest.update({
      where: { id: hireId },
      data: { status: 'CANCELLED' },
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
            description: true,
            priceCents: true,
          },
        },
      },
    });

    // Create notification for the other party
    const otherPartyId = hireRequest.buyerId === req.user!.id 
      ? hireRequest.studentId 
      : hireRequest.buyerId;

    await createNotification(
      otherPartyId,
      'HIRE_REJECTED', // Using existing type for cancellation
      'Hire Request Cancelled',
      `The hire request for "${hireRequest.service.title}" has been cancelled`
    );

    return sendSuccess(res, updatedHireRequest, 'Hire request cancelled successfully');
  } catch (error) {
    throw error;
  }
};
