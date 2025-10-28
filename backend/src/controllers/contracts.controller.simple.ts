import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { AuthenticatedRequest } from '../types/express.js';
import { sendSuccess, sendCreated, sendError, sendValidationError, sendNotFound, sendForbidden } from '../utils/responses.js';
import { createNotification } from '../domain/notifications.js';

// Create Contract Schema
const createContractSchema = z.object({
  hireRequestId: z.string(),
  deliverables: z.array(z.string()).min(1),
  timeline: z.number().min(1),
  additionalTerms: z.string().optional(),
});

// Sign Contract Schema
const signContractSchema = z.object({
  signature: z.string().min(1),
});

// Update Progress Schema
const updateProgressSchema = z.object({
  status: z.string(),
  notes: z.string(),
});

// Mark Completed Schema
const markCompletedSchema = z.object({
  completionNotes: z.string().optional(),
});

// Create a new contract
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
      },
    });

    if (!hireRequest) {
      return sendNotFound(res, 'Hire request not found');
    }

    // Only student can create contract
    if (hireRequest.studentId !== userId) {
      return sendForbidden(res, 'Only the student can create contracts');
    }

    // Check if hire request is accepted
    if (hireRequest.status !== 'ACCEPTED') {
      return sendError(res, 'Contract can only be created for accepted hire requests', 400);
    }

    // Check if contract already exists
    const existingContract = await prisma.contract.findUnique({
      where: { hireRequestId: hireRequest.id },
    });

    if (existingContract) {
      return sendError(res, 'Contract already exists for this hire request', 409);
    }

    // Calculate pricing
    const priceCents = hireRequest.priceCents || hireRequest.service.priceCents;
    const platformFeeCents = Math.round(priceCents * 0.1); // 10% platform fee
    const studentPayoutCents = priceCents - platformFeeCents;

    // Create contract
    const contract = await prisma.contract.create({
      data: {
        hireRequestId: hireRequest.id,
        buyerId: hireRequest.buyerId,
        studentId: hireRequest.studentId,
        serviceId: hireRequest.serviceId,
        title: `Contract for ${hireRequest.service.title}`,
        terms: JSON.stringify({
          deliverables: validatedData.deliverables,
          timeline: validatedData.timeline,
          additionalTerms: validatedData.additionalTerms || 'Standard terms apply',
        }),
        status: 'DRAFT',
        paymentStatus: 'PENDING',
        progressStatus: 'NOT_STARTED',
        priceCents: priceCents,
        timeline: validatedData.timeline,
        deliverables: JSON.stringify(validatedData.deliverables),
        studentPayoutCents,
        platformFeeCents,
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        hireRequest: {
          include: {
            service: true,
          },
        },
      },
    });

    // Create notification for buyer
    await createNotification(
      hireRequest.buyerId,
      'CONTRACT_CREATED',
      'New Contract Created',
      `${hireRequest.student.name} has created a contract for "${hireRequest.service.title}"`
    );

    return sendCreated(res, contract, 'Contract created successfully');
  } catch (error) {
    console.error('Error creating contract:', error);
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    return sendError(res, 'Failed to create contract', 500);
  }
};

// Get a specific contract
export const getContract = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { contractId } = req.params;
    const userId = req.user!.id;

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        hireRequest: {
          include: {
            service: {
              select: {
                id: true,
                title: true,
                description: true,
                priceCents: true,
              },
            },
          },
        },
      },
    });

    if (!contract) {
      return sendNotFound(res, 'Contract not found');
    }

    // Check access
    if (contract.buyerId !== userId && contract.studentId !== userId) {
      return sendForbidden(res, 'Access denied');
    }

    // Parse terms and prepare response
    const terms = JSON.parse(contract.terms);
    const response = {
      ...contract,
      deliverables: JSON.stringify(terms.deliverables),
      timeline: terms.timeline,
      description: terms.additionalTerms || 'Standard terms apply',
      priceCents: contract.hireRequest.service.priceCents,
      service: contract.hireRequest.service,
    };

    return sendSuccess(res, response);
  } catch (error) {
    console.error('Error fetching contract:', error);
    return sendError(res, 'Failed to fetch contract', 500);
  }
};

// Get all contracts for the current user
export const getUserContracts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { hireRequestId } = req.query;

    const whereClause: any = {
      OR: [
        { buyerId: userId },
        { studentId: userId },
      ],
    };

    // Add hireRequestId filter if provided
    if (hireRequestId) {
      whereClause.hireRequestId = hireRequestId;
    }

    const contracts = await prisma.contract.findMany({
      where: whereClause,
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        hireRequest: {
          include: {
            service: {
              select: {
                id: true,
                title: true,
                description: true,
                priceCents: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Parse terms for each contract
    const formattedContracts = contracts.map(contract => {
      const terms = JSON.parse(contract.terms);
      return {
        ...contract,
        deliverables: contract.deliverables || JSON.stringify(terms.deliverables),
        timeline: contract.timeline || terms.timeline,
        description: terms.additionalTerms || 'Standard terms apply',
        priceCents: contract.priceCents || contract.hireRequest.service.priceCents,
        service: contract.hireRequest.service,
      };
    });

    return sendSuccess(res, formattedContracts);
  } catch (error) {
    console.error('Error fetching user contracts:', error);
    return sendError(res, 'Failed to fetch contracts', 500);
  }
};

// Sign contract
export const signContract = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { contractId } = req.params;
    const validatedData = signContractSchema.parse(req.body);
    const userId = req.user!.id;

    console.log('Sign contract request:', { contractId, userId, body: req.body });

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        buyer: true,
        student: true,
        hireRequest: {
          include: {
            service: true,
          },
        },
      },
    });

    if (!contract) {
      console.log('Contract not found:', contractId);
      return sendNotFound(res, 'Contract not found');
    }

    console.log('Contract found:', { 
      id: contract.id, 
      buyerId: contract.buyerId, 
      studentId: contract.studentId,
      isSignedByBuyer: contract.isSignedByBuyer,
      isSignedByStudent: contract.isSignedByStudent
    });

    // Check access
    if (contract.buyerId !== userId && contract.studentId !== userId) {
      console.log('Access denied:', { userId, buyerId: contract.buyerId, studentId: contract.studentId });
      return sendForbidden(res, 'Access denied');
    }

    // Update signature
    const isBuyer = contract.buyerId === userId;
    const updateData: any = {};

    console.log('User role check:', { isBuyer, userId, buyerId: contract.buyerId, studentId: contract.studentId });

    if (isBuyer) {
      if (contract.isSignedByBuyer) {
        console.log('Buyer already signed');
        return sendError(res, 'You have already signed this contract', 400);
      }
      updateData.isSignedByBuyer = true;
      console.log('Setting buyer signature');
    } else {
      if (contract.isSignedByStudent) {
        console.log('Student already signed');
        return sendError(res, 'You have already signed this contract', 400);
      }
      updateData.isSignedByStudent = true;
      console.log('Setting student signature');
    }

    // If both parties signed, activate contract
    const bothSigned = isBuyer ? contract.isSignedByStudent : contract.isSignedByBuyer;
    
    console.log('Both signed check:', { bothSigned, isBuyer, buyerSigned: contract.isSignedByBuyer, studentSigned: contract.isSignedByStudent });
    
    if (bothSigned) {
      updateData.status = 'ACTIVE';
      updateData.signedAt = new Date();
      console.log('Activating contract');
    }

    console.log('Update data:', updateData);

    const updatedContract = await prisma.contract.update({
      where: { id: contractId },
      data: updateData,
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        hireRequest: {
          include: {
            service: {
              select: {
                id: true,
                title: true,
                description: true,
                priceCents: true,
              },
            },
          },
        },
      },
    });

    // Create notification for the other party
    const otherPartyId = isBuyer ? contract.studentId : contract.buyerId;
    const signerName = isBuyer ? contract.buyer?.name : contract.student?.name;
    
    if (otherPartyId && signerName && contract.hireRequest?.service?.title) {
      await createNotification(
        otherPartyId,
        'CONTRACT_SIGNED',
        'Contract Signed',
        `${signerName} has signed the contract for "${contract.hireRequest.service.title}"`
      );
    }

    // Parse terms for response
    const terms = JSON.parse(updatedContract.terms);
    const response = {
      ...updatedContract,
      deliverables: updatedContract.deliverables || JSON.stringify(terms.deliverables),
      timeline: updatedContract.timeline || terms.timeline,
      description: terms.additionalTerms || 'Standard terms apply',
      priceCents: updatedContract.priceCents || updatedContract.hireRequest.service.priceCents,
      service: updatedContract.hireRequest.service,
    };

    return sendSuccess(res, response, 'Contract signed successfully');
  } catch (error) {
    console.error('Error signing contract:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'UnknownError'
    });
    if (error instanceof z.ZodError) {
      console.error('Validation errors:', error.errors);
      return sendValidationError(res, error.errors);
    }
    return sendError(res, 'Failed to sign contract', 500);
  }
};

// Process payment (buyer only)
export const processPayment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { contractId } = req.params;
    const userId = req.user!.id;

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        buyer: true,
        student: true,
        hireRequest: {
          include: {
            service: true,
          },
        },
      },
    });

    if (!contract) {
      return sendNotFound(res, 'Contract not found');
    }

    // Only buyer can pay
    if (contract.buyerId !== userId) {
      return sendForbidden(res, 'Only the buyer can process payment');
    }

    // Check if both parties signed
    if (!contract.isSignedByBuyer || !contract.isSignedByStudent) {
      return sendError(res, 'Both parties must sign before payment', 400);
    }

    // Check if already paid
    if (contract.paymentStatus === 'PAID') {
      return sendError(res, 'Payment already processed', 400);
    }

    // Demo payment processing (in real app, integrate with payment processor like Stripe)
    console.log('Processing demo payment for contract:', contractId);
    
    const updatedContract = await prisma.contract.update({
      where: { id: contractId },
      data: {
        paymentStatus: 'PAID',
        paidAt: new Date(),
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        hireRequest: {
          include: {
            service: {
              select: {
                id: true,
                title: true,
                description: true,
                priceCents: true,
              },
            },
          },
        },
      },
    });

    // Notify student
    if (contract.studentId && contract.hireRequest?.service?.title) {
      await createNotification(
        contract.studentId,
        'PAYMENT_RECEIVED',
        'Payment Received',
        `Payment for "${contract.hireRequest.service.title}" has been placed in escrow`
      );
    }

    // Parse terms for response
    const terms = JSON.parse(updatedContract.terms);
    const response = {
      ...updatedContract,
      deliverables: JSON.stringify(terms.deliverables),
      timeline: terms.timeline,
      description: terms.additionalTerms || 'Standard terms apply',
      priceCents: updatedContract.hireRequest.service.priceCents,
      service: updatedContract.hireRequest.service,
    };

    return sendSuccess(res, response, 'Payment processed successfully');
  } catch (error) {
    console.error('Error processing payment:', error);
    return sendError(res, 'Failed to process payment', 500);
  }
};

// Update progress (student only)
export const updateProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { contractId } = req.params;
    const validatedData = updateProgressSchema.parse(req.body);
    const userId = req.user!.id;

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        buyer: true,
        student: true,
        hireRequest: {
          include: {
            service: true,
          },
        },
      },
    });

    if (!contract) {
      return sendNotFound(res, 'Contract not found');
    }

    // Only student can update progress
    if (contract.studentId !== userId) {
      return sendForbidden(res, 'Only the student can update progress');
    }

    const updatedContract = await prisma.contract.update({
      where: { id: contractId },
      data: {
        progressStatus: validatedData.status,
        progressNotes: validatedData.notes,
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        hireRequest: {
          include: {
            service: {
              select: {
                id: true,
                title: true,
                description: true,
                priceCents: true,
              },
            },
          },
        },
      },
    });

    // Notify buyer
    if (contract.buyerId && contract.student?.name && contract.hireRequest?.service?.title) {
      await createNotification(
        contract.buyerId,
        'PROGRESS_UPDATED',
        'Progress Update',
        `${contract.student.name} has updated progress on "${contract.hireRequest.service.title}"`
      );
    }

    // Parse terms for response
    const terms = JSON.parse(updatedContract.terms);
    const response = {
      ...updatedContract,
      deliverables: JSON.stringify(terms.deliverables),
      timeline: terms.timeline,
      description: terms.additionalTerms || 'Standard terms apply',
      priceCents: updatedContract.hireRequest.service.priceCents,
      service: updatedContract.hireRequest.service,
    };

    return sendSuccess(res, response, 'Progress updated successfully');
  } catch (error) {
    console.error('Error updating progress:', error);
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    return sendError(res, 'Failed to update progress', 500);
  }
};

// Mark contract as completed (buyer only)
export const markCompleted = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { contractId } = req.params;
    const validatedData = markCompletedSchema.parse(req.body);
    const userId = req.user!.id;

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        buyer: true,
        student: true,
        hireRequest: {
          include: {
            service: true,
          },
        },
      },
    });

    if (!contract) {
      return sendNotFound(res, 'Contract not found');
    }

    // Only buyer can mark as completed
    if (contract.buyerId !== userId) {
      return sendForbidden(res, 'Only the buyer can mark as completed');
    }

    // Check if paid
    if (contract.paymentStatus !== 'PAID') {
      return sendError(res, 'Payment must be completed first', 400);
    }

    const updatedContract = await prisma.contract.update({
      where: { id: contractId },
      data: {
        status: 'COMPLETED',
        paymentStatus: 'RELEASED',
        progressStatus: 'COMPLETED',
        completionNotes: validatedData.completionNotes,
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        hireRequest: {
          include: {
            service: {
              select: {
                id: true,
                title: true,
                description: true,
                priceCents: true,
              },
            },
          },
        },
      },
    });

    // Notify student of payment release
    if (contract.studentId && contract.hireRequest?.service?.title) {
      await createNotification(
        contract.studentId,
        'CONTRACT_COMPLETED',
        'Payment Released',
        `Payment for "${contract.hireRequest.service.title}" has been released`
      );
    }

    // Parse terms for response
    const terms = JSON.parse(updatedContract.terms);
    const response = {
      ...updatedContract,
      deliverables: JSON.stringify(terms.deliverables),
      timeline: terms.timeline,
      description: terms.additionalTerms || 'Standard terms apply',
      priceCents: updatedContract.hireRequestId ? updatedContract.hireRequest?.service?.priceCents : 0,
      service: updatedContract.hireRequestId ? updatedContract.hireRequest?.service : null,
    };

    return sendSuccess(res, response, 'Contract completed successfully');
  } catch (error) {
    console.error('Error marking contract as completed:', error);
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    return sendError(res, 'Failed to mark as completed', 500);
  }
};

// Alias functions for compatibility
export const updateContractProgress = updateProgress;
export const markContractCompleted = markCompleted;

// Download contract as PDF - TEMPORARILY DISABLED
export const downloadContractPDF = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { contractId } = req.params;
    const userId = req.user!.id;

    // Verify contract exists and user has access
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      select: {
        id: true,
        buyerId: true,
        studentId: true,
        isSignedByBuyer: true,
        isSignedByStudent: true,
      },
    });

    if (!contract) {
      return sendNotFound(res, 'Contract not found');
    }

    // Check access
    if (contract.buyerId !== userId && contract.studentId !== userId) {
      return sendForbidden(res, 'Access denied');
    }

    // Check if both parties signed
    if (!contract.isSignedByBuyer || !contract.isSignedByStudent) {
      return sendError(res, 'Contract must be signed by both parties before downloading', 400);
    }

    // PDF functionality is temporarily disabled
    return sendError(res, 'PDF download feature is temporarily unavailable. This feature will be restored in a future update.', 503);
  } catch (error) {
    console.error('Error in PDF download:', error);
    return sendError(res, 'PDF download feature is temporarily unavailable', 503);
  }
};
export const getContractProgress = getContract;
