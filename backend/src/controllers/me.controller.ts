import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { hashPassword, verifyPassword, validatePasswordStrength } from '../utils/passwords.js';
import { sendSuccess, sendError, sendValidationError } from '../utils/responses.js';
import { updateProfileSchema, changePasswordSchema } from '../validations/user.js';
import { AuthenticatedRequest } from '../types/express.js';

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        role: true,
        bio: true,
        skills: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Get additional stats
    const [serviceCount, orderCount, reviewCount, walletBalance] = await Promise.all([
      // Services owned (for students)
      prisma.service.count({
        where: { ownerId: req.user!.id }
      }),
      // Orders (buyer: sent orders, student: received orders)
      prisma.order.count({
        where: {
          OR: [
            { buyerId: req.user!.id },
            { studentId: req.user!.id }
          ]
        }
      }),
      // Reviews received
      prisma.review.count({
        where: { revieweeId: req.user!.id }
      }),
      // Wallet balance
      prisma.walletEntry.aggregate({
        where: { userId: req.user!.id },
        _sum: { amountCents: true }
      })
    ]);

    const stats = {
      serviceCount,
      orderCount,
      reviewCount,
      walletBalance: walletBalance._sum.amountCents || 0,
    };

    return sendSuccess(res, { user, stats });
  } catch (error) {
    throw error;
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = updateProfileSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: validatedData,
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        role: true,
        bio: true,
        skills: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return sendSuccess(res, user, 'Profile updated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    throw error;
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = changePasswordSchema.parse(req.body);

    // Get current user with password hash
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { passwordHash: true }
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Verify current password
    const isValidPassword = await verifyPassword(validatedData.currentPassword, user.passwordHash);
    if (!isValidPassword) {
      return sendError(res, 'Current password is incorrect', 400);
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(validatedData.newPassword);
    if (!passwordValidation.isValid) {
      return sendError(res, 'Password validation failed', 422, passwordValidation.errors);
    }

    // Hash new password
    const newPasswordHash = await hashPassword(validatedData.newPassword);

    // Update password
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { passwordHash: newPasswordHash }
    });

    return sendSuccess(res, null, 'Password changed successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    throw error;
  }
};
