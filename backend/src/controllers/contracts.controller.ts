import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { AuthenticatedRequest } from '../types/express.js';
import { sendSuccess, sendCreated, sendError, sendValidationError, sendNotFound } from '../utils/responses.js';
import { createNotification } from '../domain/notifications.js';

const createContractSchema = z.object({
  hireRequestId: z.string(),
  deliverables: z.array(z.string()),
  timeline: z.number().min(1).max(365), // 1 day to 1 year
  additionalTerms: z.string().optional(),
});

const signContractSchema = z.object({
  signature: z.string().min(1, 'Signature is required'),
});

const updateProgressSchema = z.object({
  status: z.string(),
  notes: z.string(),
  attachments: z.array(z.string()).optional(),
});

const markCompletedSchema = z.object({
  completionNotes: z.string().optional(),
});

export const createContract = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = createContractSchema.parse(req.body);
    const userId = req.user!.id;

    // Get hire request details
    const hireRequest = await prisma.hireRequest.findUnique({
      where: { id: validatedData.hireRequestId },
      include: {
        service: true,
        buyer: true,
        student: true,
        contract: true,
      },
    });

    if (!hireRequest) {
      return sendNotFound(res, 'Hire request not found');
    }

    if (hireRequest.status !== 'ACCEPTED') {
      return sendError(res, 'Contract can only be created from accepted hire requests', 400);
    }

    if (hireRequest.studentId !== userId) {
      return sendError(res, 'Only the student can create the contract', 403);
    }

    if (hireRequest.contract) {
      return sendError(res, 'Contract already exists for this hire request', 400);
    }

    // Calculate pricing
    const priceCents = hireRequest.priceCents || hireRequest.service.priceCents;
    const platformFeeCents = Math.round(priceCents * 0.10); // 10% commission
    const studentPayoutCents = priceCents - platformFeeCents;

    // Create contract
    const contract = await prisma.contract.create({
      data: {
        hireRequestId: validatedData.hireRequestId,
        buyerId: hireRequest.buyerId,
        studentId: hireRequest.studentId,
        serviceId: hireRequest.serviceId,
        title: hireRequest.service.title,
        description: hireRequest.service.description,
        deliverables: JSON.stringify(validatedData.deliverables),
        timeline: validatedData.timeline,
        priceCents,
        platformFeeCents,
        studentPayoutCents,
        status: 'DRAFT',
      },
      include: {
        buyer: { select: { id: true, name: true, email: true } },
        student: { select: { id: true, name: true, email: true } },
        service: { select: { id: true, title: true, description: true } },
      },
    });

    // Notify buyer
    await createNotification(
      hireRequest.buyerId,
      'CONTRACT_CREATED',
      'Contract Created',
      `A contract has been created for "${contract.title}". Please review and sign.`
    );

    return sendCreated(res, contract, 'Contract created successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    throw error;
  }
};

export const getContract = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { contractId } = req.params;
    const userId = req.user!.id;

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        buyer: { select: { id: true, name: true, email: true } },
        student: { select: { id: true, name: true, email: true } },
        service: { select: { id: true, title: true, description: true } },
        signatures: {
          include: {
            user: { select: { id: true, name: true } }
          }
        },
        progressUpdates: {
          include: {
            user: { select: { id: true, name: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      },
    });

    if (!contract) {
      return sendNotFound(res, 'Contract not found');
    }

    if (contract.buyerId !== userId && contract.studentId !== userId && req.user!.role !== 'ADMIN') {
      return sendError(res, 'Access denied', 403);
    }

    return sendSuccess(res, contract);
  } catch (error) {
    throw error;
  }
};

export const signContract = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { contractId } = req.params;
    const validatedData = signContractSchema.parse(req.body);
    const userId = req.user!.id;

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: { buyer: true, student: true },
    });

    if (!contract) {
      return sendNotFound(res, 'Contract not found');
    }

    if (contract.buyerId !== userId && contract.studentId !== userId) {
      return sendError(res, 'Access denied', 403);
    }

    // Check if already signed by this user
    const existingSignature = await prisma.contractSignature.findUnique({
      where: {
        contractId_userId: {
          contractId,
          userId,
        },
      },
    });

    if (existingSignature) {
      return sendError(res, 'Contract already signed by this user', 400);
    }

    // Create signature
    await prisma.contractSignature.create({
      data: {
        contractId,
        userId,
        signature: validatedData.signature,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      },
    });

    // Update contract status
    const isBuyer = contract.buyerId === userId;
    const updateData: any = {};
    
    if (isBuyer) {
      updateData.isSignedByBuyer = true;
    } else {
      updateData.isSignedByStudent = true;
    }

    // Check if both parties have signed
    const signatures = await prisma.contractSignature.findMany({
      where: { contractId },
    });

    if (signatures.length === 2) {
      updateData.status = 'PENDING_SIGNATURES';
      updateData.signedAt = new Date();
    }

    const updatedContract = await prisma.contract.update({
      where: { id: contractId },
      data: updateData,
      include: {
        buyer: { select: { id: true, name: true, email: true } },
        student: { select: { id: true, name: true, email: true } },
        service: { select: { id: true, title: true, description: true } },
      },
    });

    // Notify the other party
    const otherPartyId = isBuyer ? contract.studentId : contract.buyerId;
    const signerRole = isBuyer ? 'buyer' : 'student';
    
    await createNotification(
      otherPartyId,
      'CONTRACT_SIGNED',
      'Contract Signed',
      `The ${signerRole} has signed the contract for "${contract.title}".`
    );

    return sendSuccess(res, updatedContract, 'Contract signed successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    throw error;
  }
};

export const processPayment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { contractId } = req.params;
    const userId = req.user!.id;

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: { buyer: true, student: true },
    });

    if (!contract) {
      return sendNotFound(res, 'Contract not found');
    }

    if (contract.buyerId !== userId) {
      return sendError(res, 'Only the buyer can process payment', 403);
    }

    if (!contract.isSignedByBuyer || !contract.isSignedByStudent) {
      return sendError(res, 'Contract must be fully signed before payment', 400);
    }

    if (contract.paymentStatus !== 'PENDING') {
      return sendError(res, 'Payment already processed', 400);
    }

    // Here you would integrate with Stripe
    // For now, we'll simulate the payment
    const updatedContract = await prisma.contract.update({
      where: { id: contractId },
      data: {
        status: 'ACTIVE',
        paymentStatus: 'PAID',
        paidAt: new Date(),
        // In real implementation, store Stripe payment intent ID
        paymentIntentId: `pi_${Date.now()}`,
      },
    });

    // Notify student
    await createNotification(
      contract.studentId,
      'PAYMENT_RECEIVED',
      'Payment Received',
      `Payment has been received for "${contract.title}". You can now start working.`
    );

    return sendSuccess(res, updatedContract, 'Payment processed successfully');
  } catch (error) {
    throw error;
  }
};

export const updateProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { contractId } = req.params;
    const validatedData = updateProgressSchema.parse(req.body);
    const userId = req.user!.id;

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      return sendNotFound(res, 'Contract not found');
    }

    if (contract.studentId !== userId) {
      return sendError(res, 'Only the student can update progress', 403);
    }

    if (contract.status !== 'ACTIVE') {
      return sendError(res, 'Contract must be active to update progress', 400);
    }

    // Create progress entry
    await prisma.contractProgress.create({
      data: {
        contractId,
        userId,
        status: validatedData.status,
        notes: validatedData.notes,
        attachments: validatedData.attachments ? JSON.stringify(validatedData.attachments) : null,
      },
    });

    // Update contract progress status
    const updatedContract = await prisma.contract.update({
      where: { id: contractId },
      data: {
        progressStatus: validatedData.status,
        progressNotes: validatedData.notes,
      },
    });

    // Notify buyer
    await createNotification(
      contract.buyerId,
      'PROGRESS_UPDATED',
      'Progress Updated',
      `Progress has been updated for "${contract.title}": ${validatedData.status}`
    );

    return sendSuccess(res, updatedContract, 'Progress updated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    throw error;
  }
};

export const markCompleted = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { contractId } = req.params;
    const validatedData = markCompletedSchema.parse(req.body);
    const userId = req.user!.id;

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      return sendNotFound(res, 'Contract not found');
    }

    if (contract.buyerId !== userId) {
      return sendError(res, 'Only the buyer can mark as completed', 403);
    }

    if (contract.status !== 'ACTIVE') {
      return sendError(res, 'Contract must be active to mark as completed', 400);
    }

    if (contract.paymentStatus !== 'PAID') {
      return sendError(res, 'Payment must be processed before completion', 400);
    }

    // Update contract status
    const updatedContract = await prisma.contract.update({
      where: { id: contractId },
      data: {
        status: 'COMPLETED',
        progressStatus: 'COMPLETED',
        completionNotes: validatedData.completionNotes,
        releasedAt: new Date(),
        paymentStatus: 'RELEASED',
      },
    });

    // Release payment to student (add to wallet)
    await prisma.walletEntry.create({
      data: {
        userId: contract.studentId,
        amountCents: contract.studentPayoutCents,
        reason: `Payment for completed contract: ${contract.title}`,
      },
    });

    // Add platform fee to platform tracking (you might want to create a platform user)
    // For now, we'll just log it
    console.log(`Platform fee earned: $${contract.platformFeeCents / 100} from contract ${contractId}`);

    // Notify student
    await createNotification(
      contract.studentId,
      'CONTRACT_COMPLETED',
      'Contract Completed',
      `Contract "${contract.title}" has been marked as completed. Payment of $${contract.studentPayoutCents / 100} has been released to your wallet.`
    );

    return sendSuccess(res, updatedContract, 'Contract completed and payment released');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    throw error;
  }
};

export const getUserContracts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { status } = req.query;

    const whereClause: any = {
      OR: [
        { buyerId: userId },
        { studentId: userId }
      ]
    };

    if (status) {
      whereClause.status = status;
    }

    const contracts = await prisma.contract.findMany({
      where: whereClause,
      include: {
        buyer: { select: { id: true, name: true, email: true } },
        student: { select: { id: true, name: true, email: true } },
        service: { select: { id: true, title: true, description: true } },
        hireRequest: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' }
    });

    return sendSuccess(res, contracts);
  } catch (error) {
    throw error;
  }
};
