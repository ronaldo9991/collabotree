import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { AuthenticatedRequest } from '../types/express.js';
import { sendSuccess, sendCreated, sendValidationError, sendNotFound, sendForbidden, sendError } from '../utils/responses.js';
import { parsePagination, createPaginationResult } from '../utils/pagination.js';
import { createServiceSchema, updateServiceSchema, getServicesSchema } from '../validations/service.js';

export const createService = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('🔍 createService called with body:', req.body);
    
    const validatedData = createServiceSchema.parse(req.body);
    const userId = req.user!.id;

    console.log('👤 Creating service for user:', userId);
    console.log('📝 Service data:', validatedData);

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

    console.log('✅ Service created successfully:', service.id, service.title);
    return sendCreated(res, service, 'Service created successfully');
  } catch (error) {
    console.error('❌ Error in createService:', error);
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    return sendError(res, 'Failed to create service', 500);
  }
};

export const getServices = async (req: Request, res: Response) => {
  try {
    console.log('🔍 getServices called with query:', req.query);
    
    const query = getServicesSchema.parse(req.query);
    const pagination = parsePagination(query);

    // Build where clause
    const where: any = {
      isActive: true,
    };

    // Filter by owner if specified
    if (query.ownerId) {
      where.ownerId = query.ownerId;
    }

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
        where.priceCents.gte = query.minPrice * 100;
      }
      if (query.maxPrice) {
        where.priceCents.lte = query.maxPrice * 100;
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

    console.log('🔍 Database query where clause:', JSON.stringify(where, null, 2));
    console.log('🔍 Database query orderBy:', JSON.stringify(orderBy, null, 2));

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

    console.log(`✅ Found ${services.length} services out of ${total} total`);
    
    if (services.length > 0) {
      console.log('📋 Sample service titles:', services.slice(0, 3).map(s => s.title));
    }

    const result = createPaginationResult(services, pagination, total);
    return sendSuccess(res, result);
  } catch (error) {
    console.error('❌ Error in getServices:', error);
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    return sendError(res, 'Failed to fetch services', 500);
  }
};

export const getService = async (req: Request, res: Response) => {
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
    console.error('❌ Error in getService:', error);
    return sendError(res, 'Failed to fetch service', 500);
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
    console.error('❌ Error in updateService:', error);
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    return sendError(res, 'Failed to update service', 500);
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

    await prisma.service.delete({
      where: { id },
    });

    return sendSuccess(res, null, 'Service deleted successfully');
  } catch (error) {
    console.error('❌ Error in deleteService:', error);
    return sendError(res, 'Failed to delete service', 500);
  }
};
