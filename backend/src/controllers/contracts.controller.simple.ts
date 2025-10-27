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

    const contracts = await prisma.contract.findMany({
      where: {
        OR: [
          { buyerId: userId },
          { studentId: userId },
        ],
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Parse terms for each contract
    const formattedContracts = contracts.map(contract => {
      const terms = JSON.parse(contract.terms);
      return {
        ...contract,
        deliverables: JSON.stringify(terms.deliverables),
        timeline: terms.timeline,
        description: terms.additionalTerms || 'Standard terms apply',
        priceCents: contract.hireRequest.service.priceCents,
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

    // Check access
    if (contract.buyerId !== userId && contract.studentId !== userId) {
      return sendForbidden(res, 'Access denied');
    }

    // Update signature
    const isBuyer = contract.buyerId === userId;
    const updateData: any = {};

    if (isBuyer) {
      if (contract.isSignedByBuyer) {
        return sendError(res, 'You have already signed this contract', 400);
      }
      updateData.isSignedByBuyer = true;
    } else {
      if (contract.isSignedByStudent) {
        return sendError(res, 'You have already signed this contract', 400);
      }
      updateData.isSignedByStudent = true;
    }

    // If both parties signed, activate contract
    const bothSigned = (isBuyer ? true : contract.isSignedByBuyer) && 
                      (!isBuyer ? true : contract.isSignedByStudent);
    
    if (bothSigned) {
      updateData.status = 'ACTIVE';
      updateData.signedAt = new Date();
    }

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
    const signerName = isBuyer ? contract.buyer.name : contract.student.name;
    
    await createNotification(
      otherPartyId,
      'CONTRACT_SIGNED',
      'Contract Signed',
      `${signerName} has signed the contract for "${contract.hireRequest.service.title}"`
    );

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

    return sendSuccess(res, response, 'Contract signed successfully');
  } catch (error) {
    console.error('Error signing contract:', error);
    if (error instanceof z.ZodError) {
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

    // Update payment status (in real app, integrate with payment processor)
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
    await createNotification(
      contract.studentId,
      'PAYMENT_RECEIVED',
      'Payment Received',
      `Payment for "${contract.hireRequest.service.title}" has been placed in escrow`
    );

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
    await createNotification(
      contract.buyerId,
      'PROGRESS_UPDATE',
      'Progress Update',
      `${contract.student.name} has updated progress on "${contract.hireRequest.service.title}"`
    );

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
        releasedAt: new Date(),
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
    await createNotification(
      contract.studentId,
      'PAYMENT_RELEASED',
      'Payment Released',
      `Payment for "${contract.hireRequest.service.title}" has been released`
    );

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
export const getContractProgress = getContract;
