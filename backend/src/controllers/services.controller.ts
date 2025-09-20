import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { sendSuccess, sendCreated, sendError, sendValidationError, sendNotFound } from '../utils/responses.js';
import { createServiceSchema, updateServiceSchema, getServiceSchema, getServicesSchema } from '../validations/service.js';
import { AuthenticatedRequest } from '../types/express.js';
import { parsePagination, createPaginationResult } from '../utils/pagination.js';

export const createService = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Debug logging
    console.log('Creating service for user:', req.user?.id, 'Role:', req.user?.role);

    const validatedData = createServiceSchema.parse(req.body);

    // Ensure the user is a student
    if (req.user!.role !== 'STUDENT') {
      return sendError(res, 'Only students can create services', 403);
    }

    const service = await prisma.service.create({
      data: {
        ...validatedData,
        ownerId: req.user!.id,
        isActive: true, // Ensure service is active by default
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            bio: true,
            skills: true,
          },
        },
      },
    });

    console.log('Service created successfully:', service.id);
    return sendCreated(res, service, 'Service created successfully');
  } catch (error) {
    console.error('Error creating service:', error);
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    throw error;
  }
};

export const getServices = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = getServicesSchema.parse(req.query);
    const pagination = parsePagination(validatedData);

    // Build where clause
    const where: any = {
      isActive: true,
    };

    if (validatedData.q) {
      where.OR = [
        { title: { contains: validatedData.q, mode: 'insensitive' } },
        { description: { contains: validatedData.q, mode: 'insensitive' } },
      ];
    }

    if (validatedData.minPrice) {
      where.priceCents = { ...where.priceCents, gte: validatedData.minPrice };
    }

    if (validatedData.maxPrice) {
      where.priceCents = { ...where.priceCents, lte: validatedData.maxPrice };
    }

    if (validatedData.ownerId) {
      where.ownerId = validatedData.ownerId;
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[validatedData.sortBy] = validatedData.sortOrder;

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              bio: true,
              skills: true,
            },
          },
        },
        orderBy,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.service.count({ where }),
    ]);

    const result = createPaginationResult(services, pagination, total);

    return sendSuccess(res, result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    throw error;
  }
};

export const getService = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = getServiceSchema.parse(req.params);

    const service = await prisma.service.findUnique({
      where: { id: validatedData.id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            bio: true,
            skills: true,
          },
        },
      },
    });

    if (!service) {
      return sendNotFound(res, 'Service not found');
    }

    return sendSuccess(res, service);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    throw error;
  }
};

export const updateService = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = updateServiceSchema.parse(req.body);
    const serviceId = req.params.id;

    // Check if service exists and user owns it
    const existingService = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { ownerId: true }
    });

    if (!existingService) {
      return sendNotFound(res, 'Service not found');
    }

    if (existingService.ownerId !== req.user!.id) {
      return sendError(res, 'Access denied', 403);
    }

    const service = await prisma.service.update({
      where: { id: serviceId },
      data: validatedData,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            bio: true,
            skills: true,
          },
        },
      },
    });

    return sendSuccess(res, service, 'Service updated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    throw error;
  }
};

export const deleteService = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const serviceId = req.params.id;

    // Check if service exists and user owns it
    const existingService = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { ownerId: true }
    });

    if (!existingService) {
      return sendNotFound(res, 'Service not found');
    }

    if (existingService.ownerId !== req.user!.id) {
      return sendError(res, 'Access denied', 403);
    }

    // Soft delete by setting isActive to false
    await prisma.service.update({
      where: { id: serviceId },
      data: { isActive: false }
    });

    return sendSuccess(res, null, 'Service deleted successfully');
  } catch (error) {
    throw error;
  }
};
