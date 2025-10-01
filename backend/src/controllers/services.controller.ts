import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { AuthenticatedRequest } from '../types/express.js';
import { sendSuccess, sendCreated, sendValidationError, sendNotFound, sendForbidden } from '../utils/response.js';
import { parsePagination, createPaginationResult } from '../utils/pagination.js';

// Validation schemas
const createServiceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters'),
  priceCents: z.number().int().min(100, 'Price must be at least $1.00').max(1000000, 'Price must be less than $10,000.00'),
});

const updateServiceSchema = createServiceSchema.partial();

const getServicesSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  sortBy: z.enum(['createdAt', 'priceCents', 'title']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const createService = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = createServiceSchema.parse(req.body);
    const userId = req.user!.id;

    const service = await prisma.service.create({
      data: {
        ...validatedData,
        ownerId: userId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            bio: true,
            university: true,
            skills: true,
            isVerified: true,
            idCardUrl: true,
            verifiedAt: true,
          },
        },
        _count: {
          select: {
            hireRequests: true,
            orders: true,
          },
        },
      },
    });

    return sendCreated(res, service, 'Service created successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    throw error;
  }
};

export const getServices = async (req: Request, res: Response) => {
  try {
    const query = getServicesSchema.parse(req.query);
    const pagination = parsePagination(query);

    // Build where clause
    const where: any = {
      isActive: true,
    };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { owner: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    if (query.minPrice || query.maxPrice) {
      where.priceCents = {};
      if (query.minPrice) {
        where.priceCents.gte = parseInt(query.minPrice) * 100;
      }
      if (query.maxPrice) {
        where.priceCents.lte = parseInt(query.maxPrice) * 100;
      }
    }

    // Build orderBy clause
    const orderBy: any = {};
    if (query.sortBy) {
      orderBy[query.sortBy] = query.sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    // Calculate skip for pagination
    const skip = (pagination.page - 1) * pagination.limit;

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              bio: true,
              university: true,
              skills: true,
              isVerified: true,
              idCardUrl: true,
              verifiedAt: true,
            },
          },
          _count: {
            select: {
              hireRequests: true,
              orders: true,
            },
          },
        },
        orderBy,
        take: pagination.limit,
        skip: skip,
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

export const getServiceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            bio: true,
            university: true,
            skills: true,
            isVerified: true,
            idCardUrl: true,
            verifiedAt: true,
          },
        },
        _count: {
          select: {
            hireRequests: true,
            orders: true,
          },
        },
      },
    });

    if (!service) {
      return sendNotFound(res, 'Service not found');
    }

    return sendSuccess(res, service);
  } catch (error) {
    throw error;
  }
};

export const updateService = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateServiceSchema.parse(req.body);
    const userId = req.user!.id;

    // Check if service exists and user owns it
    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      return sendNotFound(res, 'Service not found');
    }

    if (existingService.ownerId !== userId) {
      return sendForbidden(res, 'You can only update your own services');
    }

    const service = await prisma.service.update({
      where: { id },
      data: validatedData,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            bio: true,
            university: true,
            skills: true,
            isVerified: true,
            idCardUrl: true,
            verifiedAt: true,
          },
        },
        _count: {
          select: {
            hireRequests: true,
            orders: true,
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
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if service exists and user owns it
    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      return sendNotFound(res, 'Service not found');
    }

    if (existingService.ownerId !== userId) {
      return sendForbidden(res, 'You can only delete your own services');
    }

    // Soft delete by setting isActive to false
    await prisma.service.update({
      where: { id },
      data: { isActive: false },
    });

    return sendSuccess(res, null, 'Service deleted successfully');
  } catch (error) {
    throw error;
  }
};

export const getUserServices = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const query = getServicesSchema.parse(req.query);
    const pagination = parsePagination(query);

    // Build where clause
    const where: any = {
      ownerId: userId,
    };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Build orderBy clause
    const orderBy: any = {};
    if (query.sortBy) {
      orderBy[query.sortBy] = query.sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    // Calculate skip for pagination
    const skip = (pagination.page - 1) * pagination.limit;

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              bio: true,
              university: true,
              skills: true,
              isVerified: true,
              idCardUrl: true,
              verifiedAt: true,
            },
          },
          _count: {
            select: {
              hireRequests: true,
              orders: true,
            },
          },
        },
        orderBy,
        take: pagination.limit,
        skip: skip,
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