import { Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { logger } from '../config/logger';

export class VerificationController {
  // Upload student ID card
  static async uploadIdCard(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const { idCardUrl } = req.body;
      if (!idCardUrl) {
        return res.status(400).json({ success: false, error: 'ID card URL is required' });
      }

      // Update user with ID card URL
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { 
          idCardUrl,
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

      logger.info(`Student ${userId} uploaded ID card`);

      res.json({
        success: true,
        data: updatedUser,
        message: 'ID card uploaded successfully. Verification is pending review.'
      });
    } catch (error) {
      logger.error('Error uploading ID card:', error);
      res.status(500).json({ success: false, error: 'Failed to upload ID card' });
    }
  }

  // Get verification status
  static async getVerificationStatus(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
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
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      res.json({
        success: true,
        data: {
          isVerified: user.isVerified,
          idCardUrl: user.idCardUrl,
          verifiedAt: user.verifiedAt,
          hasUploadedId: !!user.idCardUrl
        }
      });
    } catch (error) {
      logger.error('Error getting verification status:', error);
      res.status(500).json({ success: false, error: 'Failed to get verification status' });
    }
  }

  // Admin: Verify student (for admin use)
  static async verifyStudent(req: Request, res: Response) {
    try {
      const { studentId } = req.params;
      const adminId = req.user?.id;

      if (!adminId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      // Check if user is admin
      const admin = await prisma.user.findUnique({
        where: { id: adminId },
        select: { role: true }
      });

      if (!admin || admin.role !== 'ADMIN') {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }

      // Verify the student
      const verifiedStudent = await prisma.user.update({
        where: { id: studentId },
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

      logger.info(`Admin ${adminId} verified student ${studentId}`);

      res.json({
        success: true,
        data: verifiedStudent,
        message: 'Student verified successfully'
      });
    } catch (error) {
      logger.error('Error verifying student:', error);
      res.status(500).json({ success: false, error: 'Failed to verify student' });
    }
  }

  // Admin: Get all pending verifications
  static async getPendingVerifications(req: Request, res: Response) {
    try {
      const adminId = req.user?.id;

      if (!adminId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      // Check if user is admin
      const admin = await prisma.user.findUnique({
        where: { id: adminId },
        select: { role: true }
      });

      if (!admin || admin.role !== 'ADMIN') {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }

      // Get students with uploaded ID cards but not verified
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
          createdAt: true,
          updatedAt: true
        },
        orderBy: { updatedAt: 'desc' }
      });

      res.json({
        success: true,
        data: pendingVerifications
      });
    } catch (error) {
      logger.error('Error getting pending verifications:', error);
      res.status(500).json({ success: false, error: 'Failed to get pending verifications' });
    }
  }
}
