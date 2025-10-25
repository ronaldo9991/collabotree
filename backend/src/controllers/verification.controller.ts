import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { sendSuccess, sendError } from '../utils/responses.js';
import { AuthenticatedRequest } from '../types/express.js';
import { uploadIdCardSchema, verifyStudentSchema, rejectStudentSchema } from '../validations/verification.js';
import { createNotification } from '../domain/notifications.js';

export class VerificationController {
  // Upload student ID card
  static async uploadIdCard(req: AuthenticatedRequest, res: Response) {
    try {
      const validatedData = uploadIdCardSchema.parse(req);
      const userId = req.user?.id;

      if (!userId || req.user?.role !== 'STUDENT') {
        return sendError(res, 'Only students can upload ID cards', 403);
      }

      // Check if user is already verified
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { isVerified: true }
      });

      if (existingUser?.isVerified) {
        return sendError(res, 'You are already verified', 400);
      }

      // Update user with ID card URL
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { 
          idCardUrl: validatedData.body.idCardUrl,
          updatedAt: new Date()
        },
        select: {
          id: true,
          name: true,
          email: true,
          isVerified: true,
          idCardUrl: true,
          verifiedAt: true
        }
      });

      console.log(`Student ${userId} uploaded ID card. URL length: ${validatedData.body.idCardUrl.length}`);

      return sendSuccess(res, updatedUser, 'ID card uploaded successfully. Verification is pending review.');
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(res, 'Validation failed', 422, error.errors);
      }
      console.error('Error uploading ID card:', error);
      return sendError(res, 'Failed to upload ID card', 500);
    }
  }

  // Get verification status
  static async getVerificationStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'Unauthorized', 401);
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          isVerified: true,
          idCardUrl: true,
          verifiedAt: true,
          role: true
        }
      });

      if (!user) {
        return sendError(res, 'User not found', 404);
      }

      const verificationData = {
        isVerified: user.isVerified,
        idCardUrl: user.idCardUrl,
        verifiedAt: user.verifiedAt,
        hasUploadedId: !!user.idCardUrl
      };

      return sendSuccess(res, verificationData);
    } catch (error) {
      console.error('Error getting verification status:', error);
      return sendError(res, 'Failed to get verification status', 500);
    }
  }

  // Admin: Verify student (for admin use)
  static async verifyStudent(req: AuthenticatedRequest, res: Response) {
    try {
      const validatedData = verifyStudentSchema.parse(req);
      const adminId = req.user?.id;

      if (!adminId || req.user?.role !== 'ADMIN') {
        return sendError(res, 'Admin access required', 403);
      }

      // Verify the student
      const verifiedStudent = await prisma.user.update({
        where: { id: validatedData.params.studentId },
        data: {
          isVerified: true,
          verifiedAt: new Date(),
          updatedAt: new Date()
        },
        select: {
          id: true,
          name: true,
          email: true,
          isVerified: true,
          verifiedAt: true
        }
      });

      // Create notification for student
      await createNotification(
        validatedData.params.studentId,
        'ORDER_CREATED', // Using existing type for verification
        'Verification Approved!',
        'Your student ID has been verified. You can now access all student features.'
      );

      console.log(`Admin ${adminId} verified student ${validatedData.params.studentId}`);

      return sendSuccess(res, verifiedStudent, 'Student verified successfully');
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(res, 'Validation failed', 422, error.errors);
      }
      console.error('Error verifying student:', error);
      return sendError(res, 'Failed to verify student', 500);
    }
  }

  // Admin: Reject student verification
  static async rejectStudent(req: AuthenticatedRequest, res: Response) {
    try {
      const validatedData = rejectStudentSchema.parse(req);
      const adminId = req.user?.id;

      if (!adminId || req.user?.role !== 'ADMIN') {
        return sendError(res, 'Admin access required', 403);
      }

      // Remove ID card URL to allow re-upload
      const rejectedStudent = await prisma.user.update({
        where: { id: validatedData.params.studentId },
        data: {
          idCardUrl: null,
          updatedAt: new Date()
        },
        select: {
          id: true,
          name: true,
          email: true,
          isVerified: true,
          idCardUrl: true
        }
      });

      // Create notification for student
      await createNotification(
        validatedData.params.studentId,
        'ORDER_CREATED', // Using existing type for verification
        'Verification Rejected',
        validatedData.body.reason || 'Your student ID verification was rejected. Please upload a clearer photo and try again.'
      );

      console.log(`Admin ${adminId} rejected student ${validatedData.params.studentId}`);

      return sendSuccess(res, rejectedStudent, 'Student verification rejected');
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(res, 'Validation failed', 422, error.errors);
      }
      console.error('Error rejecting student:', error);
      return sendError(res, 'Failed to reject student', 500);
    }
  }

  // Admin: Get all pending verifications
  static async getPendingVerifications(req: AuthenticatedRequest, res: Response) {
    try {
      const adminId = req.user?.id;
      const userRole = req.user?.role;

      console.log(`Admin verification request - User ID: ${adminId}, Role: ${userRole}`);

      if (!adminId) {
        console.error('No admin ID found in request');
        return sendError(res, 'Authentication required', 401);
      }

      if (userRole !== 'ADMIN') {
        console.error(`User ${adminId} with role ${userRole} attempted to access admin verification`);
        return sendError(res, 'Admin access required', 403);
      }

      // Test database connection first
      console.log('Testing database connection...');
      await prisma.$queryRaw`SELECT 1`;
      console.log('Database connection successful');

      // Get students with uploaded ID cards but not verified
      console.log('Querying database for pending verifications...');
      
      const pendingVerifications = await prisma.user.findMany({
        where: {
          role: 'STUDENT',
          idCardUrl: { not: null },
          isVerified: false
        },
        select: {
          id: true,
          name: true,
          email: true,
          idCardUrl: true,
          university: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { updatedAt: 'desc' }
      });

      console.log(`Found ${pendingVerifications.length} pending verifications`);
      if (pendingVerifications.length > 0) {
        console.log(`First verification ID card URL length: ${pendingVerifications[0].idCardUrl?.length || 0}`);
      }

      return sendSuccess(res, pendingVerifications);
    } catch (error) {
      console.error('Error getting pending verifications:', error);
      console.error('Error details:', error);
      return sendError(res, 'Failed to get pending verifications', 500);
    }
  }
}
