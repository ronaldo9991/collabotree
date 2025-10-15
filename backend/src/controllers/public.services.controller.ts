import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { sendSuccess, sendValidationError, sendError } from '../utils/responses.js';
import { parsePagination, createPaginationResult } from '../utils/pagination.js';

// Validation schema for public services
const getPublicServicesSchema = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  search: z.string().optional(),
  minPrice: z.string().transform(Number).optional(),
  maxPrice: z.string().transform(Number).optional(),
  sortBy: z.enum(['createdAt', 'priceCents', 'title']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  ownerId: z.string().optional(),
});

// Public version for homepage (no authentication required)
export const getPublicServices = async (req: Request, res: Response) => {
  try {
    const query = getPublicServicesSchema.parse(req.query);
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
