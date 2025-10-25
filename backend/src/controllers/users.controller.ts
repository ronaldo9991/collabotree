import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { sendSuccess, sendError, sendValidationError } from '../utils/responses.js';
import { getUserSchema } from '../validations/user.js';
import { AuthenticatedRequest } from '../types/express.js';

export const getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = getUserSchema.parse(req.params);

    const user = await prisma.user.findUnique({
      where: { id: validatedData.id },
      select: {
        id: true,
        name: true,
        bio: true,
        skills: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Get user's services (if student)
    const services = await prisma.service.findMany({
      where: { 
        ownerId: validatedData.id,
        isActive: true 
      },
      select: {
        id: true,
        title: true,
        description: true,
        priceCents: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Get reviews summary
    const reviews = await prisma.review.findMany({
      where: { revieweeId: validatedData.id },
      select: {
        rating: true,
        comment: true,
        createdAt: true,
        reviewer: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Calculate average rating
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    const profile = {
      ...user,
      services,
      reviews: {
        averageRating: Math.round(averageRating * 10) / 10,
        count: reviews.length,
        recent: reviews,
      },
    };

    return sendSuccess(res, profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    throw error;
  }
};
