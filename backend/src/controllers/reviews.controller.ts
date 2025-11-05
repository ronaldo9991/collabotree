import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { sendSuccess, sendCreated, sendError, sendValidationError, sendNotFound, sendConflict } from '../utils/responses.js';
import { createReviewSchema, getReviewsSchema } from '../validations/review.js';
import { AuthenticatedRequest } from '../types/express.js';
import { parsePagination, createPaginationResult } from '../utils/pagination.js';
import { canReviewOrder } from '../domain/access.js';
import { createNotification } from '../domain/notifications.js';
// NotificationType removed - using string literals

export const createReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = createReviewSchema.parse(req.body);

    // Check if user can review this order
    const canReview = await canReviewOrder(req.user!.id, validatedData.orderId);
    if (!canReview) {
      return sendError(res, 'Cannot review this order', 403);
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

    // Determine who is being reviewed
    const revieweeId = order.buyerId === req.user!.id ? order.studentId : order.buyerId;

    const review = await prisma.review.create({
      data: {
        orderId: validatedData.orderId,
        reviewerId: req.user!.id,
        revieweeId,
        rating: validatedData.rating,
        comment: validatedData.comment,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
          },
        },
        reviewee: {
          select: {
            id: true,
            name: true,
          },
        },
        order: {
          select: {
            id: true,
            service: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    // Create notification for the reviewed user
    await createNotification(
      revieweeId,
      'REVIEW_RECEIVED',
      'New Review Received',
      `You received a ${validatedData.rating}-star review for "${order.service.title}"`
    );

    return sendCreated(res, review, 'Review created successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    throw error;
  }
};

export const getReviews = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = getReviewsSchema.parse(req.params);
    const pagination = parsePagination(req.query);

    const where = {
      revieweeId: validatedData.userId,
    };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
            },
          },
          order: {
            select: {
              id: true,
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
      prisma.review.count({ where }),
    ]);

    // Calculate average rating
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    const result = createPaginationResult(reviews, pagination, total);
    
    return sendSuccess(res, {
      ...result,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: total,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    throw error;
  }
};

// Get reviews for a service (by serviceId - reviews for the student who owns the service)
export const getServiceReviews = async (req: Request, res: Response) => {
  try {
    const { serviceId } = req.params;
    const pagination = parsePagination(req.query);

    // Get the service to find the owner (student)
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: {
        ownerId: true,
      },
    });

    if (!service) {
      return sendNotFound(res, 'Service not found');
    }

    // Get reviews where:
    // 1. The reviewee is the service owner (student)
    // 2. The order's serviceId matches the requested service
    const where = {
      revieweeId: service.ownerId,
      order: {
        serviceId: serviceId,
      },
    };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
            },
          },
          order: {
            select: {
              id: true,
              service: {
                select: {
                  title: true,
                  id: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.review.count({ where }),
    ]);

    // Calculate average rating
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    const result = createPaginationResult(reviews, pagination, total);
    
    return sendSuccess(res, {
      ...result,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: total,
    });
  } catch (error) {
    console.error('❌ Error in getServiceReviews:', error);
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    return sendError(res, 'Failed to fetch service reviews', 500);
  }
};
