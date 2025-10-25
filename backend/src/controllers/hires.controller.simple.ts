import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { AuthenticatedRequest } from '../types/express.js';
import { sendSuccess, sendCreated, sendError, sendValidationError, sendNotFound } from '../utils/responses.js';
import { createHireRequestSchema, updateHireRequestSchema } from '../validations/hire.js';

// Hire requests controller for full functionality
export const createHireRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('🔍 createHireRequest called with body:', req.body);
    
    const validatedData = createHireRequestSchema.parse(req.body);
    const buyerId = req.user!.id;

    console.log('👤 Creating hire request for buyer:', buyerId);
    console.log('📝 Hire request data:', validatedData);

    // Get the service to find the student (owner)
    const service = await prisma.service.findUnique({
      where: { id: validatedData.serviceId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!service) {
      return sendNotFound(res, 'Service not found');
    }

    if (service.owner.role !== 'STUDENT') {
      return sendError(res, 'Only students can be hired', 400);
    }

    if (service.ownerId === buyerId) {
      return sendError(res, 'You cannot hire yourself', 400);
    }

    // Check if buyer already has a pending or accepted hire request for this service
    const existingHireRequest = await prisma.hireRequest.findFirst({
      where: {
        buyerId: buyerId,
        serviceId: validatedData.serviceId,
        status: {
          in: ['PENDING', 'ACCEPTED'],
        },
      },
    });

    if (existingHireRequest) {
      return sendError(res, 'You already have a hire request for this service', 400);
    }

    const hireRequest = await prisma.hireRequest.create({
      data: {
        buyerId: buyerId,
        studentId: service.ownerId,
        serviceId: validatedData.serviceId,
        message: validatedData.message,
        priceCents: validatedData.priceCents || service.priceCents,
        status: 'PENDING',
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
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

    console.log('✅ Hire request created successfully:', hireRequest.id);
    return sendCreated(res, hireRequest, 'Hire request created successfully');
  } catch (error) {
    console.error('❌ Error in createHireRequest:', error);
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    return sendError(res, 'Failed to create hire request', 500);
  }
};

export const getHireRequests = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    console.log('🔍 getHireRequests called for user:', userId, 'role:', userRole);

    let whereClause: any = {};

    if (userRole === 'BUYER') {
      whereClause.buyerId = userId;
    } else if (userRole === 'STUDENT') {
      whereClause.studentId = userId;
    }

    const hireRequests = await prisma.hireRequest.findMany({
      where: whereClause,
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`✅ Found ${hireRequests.length} hire requests for user ${userId}`);
    return sendSuccess(res, hireRequests);
  } catch (error) {
    console.error('❌ Error in getHireRequests:', error);
    return sendError(res, 'Failed to fetch hire requests', 500);
  }
};

export const getHireRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    console.log('🔍 getHireRequest called for ID:', id, 'user:', userId);

    const hireRequest = await prisma.hireRequest.findUnique({
      where: { id },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
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

    // Check if user has access to this hire request
    if (hireRequest.buyerId !== userId && hireRequest.studentId !== userId && userRole !== 'ADMIN') {
      return sendError(res, 'Access denied', 403);
    }

    return sendSuccess(res, hireRequest);
  } catch (error) {
    console.error('❌ Error in getHireRequest:', error);
    return sendError(res, 'Failed to fetch hire request', 500);
  }
};

export const acceptHireRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    console.log('🔍 acceptHireRequest called for ID:', id, 'user:', userId);

    const hireRequest = await prisma.hireRequest.findUnique({
      where: { id },
      include: {
        service: true,
      },
    });

    if (!hireRequest) {
      return sendNotFound(res, 'Hire request not found');
    }

    if (hireRequest.studentId !== userId) {
      return sendError(res, 'Only the student can accept hire requests', 403);
    }

    if (hireRequest.status !== 'PENDING') {
      return sendError(res, 'Only pending hire requests can be accepted', 400);
    }

    const updatedHireRequest = await prisma.hireRequest.update({
      where: { id },
      data: { status: 'ACCEPTED' },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
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

    console.log('✅ Hire request accepted successfully:', id);
    return sendSuccess(res, updatedHireRequest, 'Hire request accepted successfully');
  } catch (error) {
    console.error('❌ Error in acceptHireRequest:', error);
    return sendError(res, 'Failed to accept hire request', 500);
  }
};

export const rejectHireRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    console.log('🔍 rejectHireRequest called for ID:', id, 'user:', userId);

    const hireRequest = await prisma.hireRequest.findUnique({
      where: { id },
    });

    if (!hireRequest) {
      return sendNotFound(res, 'Hire request not found');
    }

    if (hireRequest.studentId !== userId) {
      return sendError(res, 'Only the student can reject hire requests', 403);
    }

    if (hireRequest.status !== 'PENDING') {
      return sendError(res, 'Only pending hire requests can be rejected', 400);
    }

    const updatedHireRequest = await prisma.hireRequest.update({
      where: { id },
      data: { status: 'REJECTED' },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
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

    console.log('✅ Hire request rejected successfully:', id);
    return sendSuccess(res, updatedHireRequest, 'Hire request rejected successfully');
  } catch (error) {
    console.error('❌ Error in rejectHireRequest:', error);
    return sendError(res, 'Failed to reject hire request', 500);
  }
};

export const cancelHireRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    console.log('🔍 cancelHireRequest called for ID:', id, 'user:', userId);

    const hireRequest = await prisma.hireRequest.findUnique({
      where: { id },
    });

    if (!hireRequest) {
      return sendNotFound(res, 'Hire request not found');
    }

    // Check if user has permission to cancel
    if (hireRequest.buyerId !== userId && hireRequest.studentId !== userId && userRole !== 'ADMIN') {
      return sendError(res, 'Access denied', 403);
    }

    if (hireRequest.status !== 'PENDING') {
      return sendError(res, 'Only pending hire requests can be cancelled', 400);
    }

    const updatedHireRequest = await prisma.hireRequest.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
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

    console.log('✅ Hire request cancelled successfully:', id);
    return sendSuccess(res, updatedHireRequest, 'Hire request cancelled successfully');
  } catch (error) {
    console.error('❌ Error in cancelHireRequest:', error);
    return sendError(res, 'Failed to cancel hire request', 500);
  }
};

export const updateHireRequestStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateHireRequestSchema.parse(req.body);
    const userId = req.user!.id;
    const userRole = req.user!.role;

    console.log('🔍 updateHireRequestStatus called for ID:', id, 'status:', validatedData.status);

    const hireRequest = await prisma.hireRequest.findUnique({
      where: { id },
    });

    if (!hireRequest) {
      return sendNotFound(res, 'Hire request not found');
    }

    // Check permissions based on status change
    if (validatedData.status === 'ACCEPTED' || validatedData.status === 'REJECTED') {
      if (hireRequest.studentId !== userId) {
        return sendError(res, 'Only the student can accept or reject hire requests', 403);
      }
    } else if (validatedData.status === 'CANCELLED') {
      if (hireRequest.buyerId !== userId && hireRequest.studentId !== userId && userRole !== 'ADMIN') {
        return sendError(res, 'Access denied', 403);
      }
    }

    const updatedHireRequest = await prisma.hireRequest.update({
      where: { id },
      data: { status: validatedData.status },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
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

    console.log('✅ Hire request status updated successfully:', id, 'to', validatedData.status);
    return sendSuccess(res, updatedHireRequest, 'Hire request status updated successfully');
  } catch (error) {
    console.error('❌ Error in updateHireRequestStatus:', error);
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    return sendError(res, 'Failed to update hire request status', 500);
  }
};
