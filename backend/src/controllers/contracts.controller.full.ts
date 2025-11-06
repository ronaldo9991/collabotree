import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { AuthenticatedRequest } from '../types/express.js';
import { sendSuccess, sendCreated, sendError, sendValidationError, sendNotFound } from '../utils/responses.js';
import { 
  createContractSchema, 
  signContractSchema, 
  updateProgressSchema, 
  markCompletedSchema 
} from '../validations/contract.js';
import { createNotification, createNotificationForUsers } from '../domain/notifications.js';

// Create a new contract (Student only)
export const createContract = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('🔍 createContract called with body:', req.body);
    
    const validatedData = createContractSchema.parse(req.body);
    const userId = req.user!.id;
    const userRole = req.user!.role;

    console.log('👤 Creating contract for user:', userId, 'role:', userRole);

    // Only students can create contracts
    if (userRole !== 'STUDENT') {
      return sendError(res, 'Only students can create contracts', 403);
    }

    // Get the hire request with related data
    const hireRequest = await prisma.hireRequest.findUnique({
      where: { id: validatedData.hireRequestId },
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
        service: {
          select: {
            id: true,
            title: true,
            description: true,
            priceCents: true,
          },
        },
      },
    });

    if (!hireRequest) {
      return sendNotFound(res, 'Hire request not found');
    }

    // Verify that the student is the one who received the hire request
    if (hireRequest.studentId !== userId) {
      return sendError(res, 'You can only create contracts for your own hire requests', 403);
    }

    // Check if hire request is accepted
    if (hireRequest.status !== 'ACCEPTED') {
      return sendError(res, 'Hire request must be accepted before creating a contract', 400);
    }

    // Check if contract already exists for this hire request
    const existingContract = await prisma.contract.findUnique({
      where: { hireRequestId: validatedData.hireRequestId },
    });

    if (existingContract) {
      return sendError(res, 'Contract already exists for this hire request', 400);
    }

    // Calculate fees (platform takes 10%)
    const priceCents = hireRequest.priceCents || hireRequest.service.priceCents;
    const platformFeeCents = Math.floor(priceCents * 0.1);
    const studentPayoutCents = priceCents - platformFeeCents;

    // Create contract terms
    const terms = JSON.stringify({
      title: hireRequest.service.title,
      description: hireRequest.service.description,
      deliverables: validatedData.deliverables,
      timeline: validatedData.timeline,
      priceCents: priceCents,
      platformFeeCents: platformFeeCents,
      studentPayoutCents: studentPayoutCents,
      additionalTerms: validatedData.additionalTerms || 'Standard terms apply',
      createdAt: new Date().toISOString(),
    });

    // Create the contract and order in a transaction
    const contract = await prisma.$transaction(async (tx) => {
      // Check if order already exists for this hire request
      let order = await tx.order.findFirst({
        where: {
          buyerId: hireRequest.buyerId,
          studentId: hireRequest.studentId,
          serviceId: hireRequest.serviceId,
        },
      });

      // Create order if it doesn't exist
      if (!order) {
        order = await tx.order.create({
          data: {
            buyerId: hireRequest.buyerId,
            studentId: hireRequest.studentId,
            serviceId: hireRequest.serviceId,
            hireRequestId: hireRequest.id,
            priceCents: priceCents,
            status: 'PENDING', // Order starts as PENDING until payment is processed
          },
        });
      }

      // Create the contract with orderId
      const newContract = await tx.contract.create({
        data: {
          hireRequestId: validatedData.hireRequestId,
          buyerId: hireRequest.buyerId,
          studentId: hireRequest.studentId,
          serviceId: hireRequest.serviceId,
          orderId: order.id, // Link order to contract
          title: hireRequest.service.title,
          terms: terms,
          status: 'DRAFT',
          paymentStatus: 'PENDING',
          progressStatus: 'NOT_STARTED',
          platformFeeCents: platformFeeCents,
          studentPayoutCents: studentPayoutCents,
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

      return newContract;
    });

    // Create notification for buyer
    await createNotification(
      hireRequest.buyerId,
      'CONTRACT_CREATED',
      'New Contract Created',
      `${hireRequest.student.name} has created a contract for "${hireRequest.service.title}"`
    );

    console.log('✅ Contract created successfully:', contract.id);
    return sendCreated(res, contract, 'Contract created successfully');
  } catch (error) {
    console.error('❌ Error in createContract:', error);
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
    const userRole = req.user!.role;

    console.log('🔍 getContract called for ID:', contractId, 'user:', userId);

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
        signatures: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!contract) {
      return sendNotFound(res, 'Contract not found');
    }

    // Check if user has access to this contract
    if (contract.buyerId !== userId && contract.studentId !== userId && userRole !== 'ADMIN') {
      return sendError(res, 'Access denied', 403);
    }

    // Parse and add terms to the response
    const parsedTerms = JSON.parse(contract.terms);
    const contractWithParsedTerms = {
      ...contract,
      ...parsedTerms,
    };

    // Use orderId directly from contract (created when contract is created)
    // If orderId is missing, try to find order by contract details (fallback for old contracts)
    let orderId = contract.orderId;
    
    if (!orderId && contract.buyerId && contract.studentId && contract.serviceId) {
      try {
        const order = await prisma.order.findFirst({
          where: {
            buyerId: contract.buyerId,
            studentId: contract.studentId,
            serviceId: contract.serviceId,
          },
        });
        if (order) {
          orderId = order.id;
          // Update contract with orderId for future requests
          await prisma.contract.update({
            where: { id: contractId },
            data: { orderId: order.id },
          });
        }
      } catch (error) {
        console.error('Error finding order for contract:', error);
      }
    }

    return sendSuccess(res, {
      ...contractWithParsedTerms,
      orderId: orderId || null, // Include orderId for frontend review submission
    });
  } catch (error) {
    console.error('❌ Error in getContract:', error);
    return sendError(res, 'Failed to fetch contract', 500);
  }
};

// Sign a contract (Both buyer and student)
export const signContract = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { contractId } = req.params;
    const validatedData = signContractSchema.parse(req.body);
    const userId = req.user!.id;
    const userRole = req.user!.role;

    console.log('🔍 signContract called for ID:', contractId, 'user:', userId);

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
                title: true,
              },
            },
          },
        },
      },
    });

    if (!contract) {
      return sendNotFound(res, 'Contract not found');
    }

    // Check if user is part of this contract
    if (contract.buyerId !== userId && contract.studentId !== userId) {
      return sendError(res, 'You are not part of this contract', 403);
    }

    // Determine which party is signing
    const isBuyer = contract.buyerId === userId;
    const isStudent = contract.studentId === userId;

    // Check if already signed
    if (isBuyer && contract.isSignedByBuyer) {
      return sendError(res, 'You have already signed this contract', 400);
    }
    if (isStudent && contract.isSignedByStudent) {
      return sendError(res, 'You have already signed this contract', 400);
    }

    // Update contract and create signature
    const updatedContract = await prisma.$transaction(async (tx) => {
      // Create signature record
      await tx.contractSignature.create({
        data: {
          contractId: contractId,
          userId: userId,
          signature: validatedData.signature,
          ipAddress: req.ip || 'unknown',
        },
      });

      // Update contract signing status
      const updateData: any = {};
      if (isBuyer) {
        updateData.isSignedByBuyer = true;
      }
      if (isStudent) {
        updateData.isSignedByStudent = true;
      }

      // If both parties have signed, activate the contract
      const bothSigned = 
        (isBuyer && contract.isSignedByStudent) || 
        (isStudent && contract.isSignedByBuyer);
      
      if (bothSigned) {
        updateData.status = 'ACTIVE';
      }

      return tx.contract.update({
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
    });

    // Create notification for the other party
    const otherPartyId = isBuyer ? contract.studentId : contract.buyerId;
    const signerName = isBuyer ? contract.buyer?.name : contract.student?.name;
    
    if (otherPartyId && signerName) {
      await createNotification(
        otherPartyId,
        'CONTRACT_SIGNED',
        'Contract Signed',
        `${signerName} has signed the contract for "${contract.hireRequest.service.title}"`
      );
    }

    // If both signed, notify both parties
    if (updatedContract.isSignedByBuyer && updatedContract.isSignedByStudent) {
      const buyerId = contract.buyerId;
      const studentId = contract.studentId;
      if (buyerId && studentId) {
        await createNotificationForUsers(
          [buyerId, studentId],
          'CONTRACT_SIGNED',
          'Contract Fully Executed',
          `Contract for "${contract.hireRequest.service.title}" is now active`
        );
      }
    }

    console.log('✅ Contract signed successfully:', contractId);
    return sendSuccess(res, updatedContract, 'Contract signed successfully');
  } catch (error) {
    console.error('❌ Error in signContract:', error);
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    return sendError(res, 'Failed to sign contract', 500);
  }
};

// Process payment (Buyer only)
export const processPayment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { contractId } = req.params;
    const userId = req.user!.id;

    console.log('🔍 processPayment called for ID:', contractId, 'user:', userId);

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
          },
        },
        hireRequest: {
          include: {
            service: {
              select: {
                id: true,
                title: true,
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

    // Only buyer can process payment
    if (contract.buyerId !== userId) {
      return sendError(res, 'Only the buyer can process payment', 403);
    }

    // Check if both parties have signed
    if (!contract.isSignedByBuyer || !contract.isSignedByStudent) {
      return sendError(res, 'Contract must be signed by both parties before payment', 400);
    }

    // Check if already paid
    if (contract.paymentStatus === 'PAID') {
      return sendError(res, 'Contract has already been paid', 400);
    }

    // Process payment and update order status
    const updatedContract = await prisma.$transaction(async (tx) => {
      // Get serviceId from contract or hireRequest
      const serviceId = contract.serviceId || contract.hireRequest.service.id;
      
      // Get or create order for this contract
      let order = null;
      
      // First, try to use existing orderId from contract
      if (contract.orderId) {
        order = await tx.order.findUnique({
          where: { id: contract.orderId },
        });
      }
      
      // If no order found, try to find by contract details
      if (!order) {
        order = await tx.order.findFirst({
          where: {
            buyerId: contract.buyerId!,
            studentId: contract.studentId!,
            serviceId: serviceId,
          },
        });
      }
      
      // Create order if it still doesn't exist (fallback for old contracts)
      if (!order) {
        order = await tx.order.create({
          data: {
            buyerId: contract.buyerId!,
            studentId: contract.studentId!,
            serviceId: serviceId,
            hireRequestId: contract.hireRequestId,
            priceCents: contract.hireRequest.service.priceCents,
            status: 'PAID',
          },
        });
      } else {
        // Update existing order status to PAID
        order = await tx.order.update({
          where: { id: order.id },
          data: { status: 'PAID' },
        });
      }

      // Update contract payment status and ensure orderId is set
      const updated = await tx.contract.update({
        where: { id: contractId },
        data: {
          paymentStatus: 'PAID',
          paidAt: new Date(),
          progressStatus: 'IN_PROGRESS',
          orderId: order.id, // Ensure orderId is set
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

      return { ...updated, orderId: order.id };
    });

    // Create notification for student
    if (contract.studentId) {
      await createNotification(
        contract.studentId,
        'PAYMENT_RECEIVED',
        'Payment Received',
        `Payment received for contract: "${contract.hireRequest.service.title}"`
      );
    }

    console.log('✅ Payment processed successfully:', contractId);
    return sendSuccess(res, updatedContract, 'Payment processed successfully');
  } catch (error) {
    console.error('❌ Error in processPayment:', error);
    return sendError(res, 'Failed to process payment', 500);
  }
};

// Update progress (Student only)
export const updateProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { contractId } = req.params;
    const validatedData = updateProgressSchema.parse(req.body);
    const userId = req.user!.id;

    console.log('🔍 updateProgress called for ID:', contractId, 'user:', userId);

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
          },
        },
        hireRequest: {
          include: {
            service: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    if (!contract) {
      return sendNotFound(res, 'Contract not found');
    }

    // Only student can update progress
    if (contract.studentId !== userId) {
      return sendError(res, 'Only the student can update progress', 403);
    }

    // Check if contract is active
    if (contract.status !== 'ACTIVE') {
      return sendError(res, 'Contract must be active to update progress', 400);
    }

    // Check if marking as completed
    if (validatedData.markAsCompleted) {
      // Check if payment has been received
      if (contract.paymentStatus !== 'PAID') {
        return sendError(res, 'Payment must be received before marking as completed', 400);
      }

      // Mark as completed and credit student wallet
      const updatedContract = await prisma.$transaction(async (tx) => {
        // Get or create order for this contract
        let order = null;
        let orderId = contract.orderId;
        
        // Try to get order from contract's orderId
        if (orderId) {
          order = await tx.order.findUnique({
            where: { id: orderId },
          });
        }
        
        // If no order found, try to find by contract details
        if (!order) {
          const serviceId = contract.serviceId || contract.hireRequest.service.id;
          order = await tx.order.findFirst({
            where: {
              buyerId: contract.buyerId!,
              studentId: contract.studentId!,
              serviceId: serviceId,
            },
          });
          if (order) {
            orderId = order.id;
          }
        }
        
        // Create order if it still doesn't exist (fallback for old contracts)
        if (!order) {
          const serviceId = contract.serviceId || contract.hireRequest.service.id;
          order = await tx.order.create({
            data: {
              buyerId: contract.buyerId!,
              studentId: contract.studentId!,
              serviceId: serviceId,
              hireRequestId: contract.hireRequestId,
              priceCents: contract.hireRequest.service.priceCents,
              status: 'COMPLETED',
            },
          });
          orderId = order.id;
        } else {
          // Update existing order status to COMPLETED
          await tx.order.update({
            where: { id: order.id },
            data: { status: 'COMPLETED' },
          });
        }

        // Update contract with completion status and ensure orderId is set
        const updated = await tx.contract.update({
          where: { id: contractId },
          data: {
            status: 'COMPLETED',
            progressStatus: 'COMPLETED',
            progressNotes: validatedData.progressNotes,
            completionNotes: validatedData.completionNotes,
            orderId: orderId, // Ensure orderId is set
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

        // Credit student wallet with their payout (after platform fee)
        if (contract.studentId && contract.studentPayoutCents) {
          await tx.walletEntry.create({
            data: {
              userId: contract.studentId,
              amountCents: contract.studentPayoutCents,
              reason: `Payment for completed contract: ${contract.hireRequest.service.title}`,
            },
          });
        }

        return { ...updated, orderId: orderId };
      });

      // Create notification for buyer
      if (contract.buyerId && contract.student?.name) {
        await createNotification(
          contract.buyerId,
          'CONTRACT_COMPLETED',
          'Contract Completed',
          `${contract.student.name} has completed the contract for "${contract.hireRequest.service.title}". Please rate your experience.`
        );
      }

      console.log('✅ Contract marked as completed via progress update:', contractId);
      return sendSuccess(res, updatedContract, 'Contract marked as completed successfully');
    }

    // Regular progress update
    const updatedContract = await prisma.contract.update({
      where: { id: contractId },
      data: {
        progressStatus: validatedData.progressStatus,
        progressNotes: validatedData.progressNotes,
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

    // Create notification for buyer
    if (contract.buyerId && contract.student?.name) {
      await createNotification(
        contract.buyerId,
        'PROGRESS_UPDATED',
        'Progress Updated',
        `${contract.student.name} updated progress on "${contract.hireRequest.service.title}"`
      );
    }

    console.log('✅ Progress updated successfully:', contractId);
    return sendSuccess(res, updatedContract, 'Progress updated successfully');
  } catch (error) {
    console.error('❌ Error in updateProgress:', error);
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    return sendError(res, 'Failed to update progress', 500);
  }
};

// Mark contract as completed (Student only)
export const markCompleted = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { contractId } = req.params;
    const validatedData = markCompletedSchema.parse(req.body);
    const userId = req.user!.id;

    console.log('🔍 markCompleted called for ID:', contractId, 'user:', userId);

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
          },
        },
        hireRequest: {
          include: {
            service: {
              select: {
                title: true,
              },
            },
            orders: {
              select: {
                id: true,
                status: true,
              },
              take: 1,
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        },
      },
    });

    if (!contract) {
      return sendNotFound(res, 'Contract not found');
    }

    // Only student can mark as completed
    if (contract.studentId !== userId) {
      return sendError(res, 'Only the student can mark contract as completed', 403);
    }

    // Check if contract is active
    if (contract.status !== 'ACTIVE') {
      return sendError(res, 'Contract must be active to mark as completed', 400);
    }

    // Check if payment has been received
    if (contract.paymentStatus !== 'PAID') {
      return sendError(res, 'Payment must be received before marking as completed', 400);
    }

    // Mark as completed and credit student wallet
    const updatedContract = await prisma.$transaction(async (tx) => {
      // Update contract
      const updated = await tx.contract.update({
        where: { id: contractId },
        data: {
          status: 'COMPLETED',
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

      // Credit student wallet with their payout (after platform fee)
      if (contract.studentId && contract.studentPayoutCents) {
        await tx.walletEntry.create({
          data: {
            userId: contract.studentId,
            amountCents: contract.studentPayoutCents,
            reason: `Payment for completed contract: ${contract.hireRequest.service.title}`,
          },
        });
      }

      return updated;
    });

    // Find the related order for review
    const order = contract.hireRequest.orders?.[0];
    let orderId = null;
    
    if (order) {
      // Update order status to COMPLETED if not already
      if (order.status !== 'COMPLETED') {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'COMPLETED' },
        });
      }
      orderId = order.id;
    }

    // Create notification for buyer
    if (contract.buyerId && contract.student?.name) {
      await createNotification(
        contract.buyerId,
        'CONTRACT_COMPLETED',
        'Contract Completed',
        `${contract.student.name} has completed the contract for "${contract.hireRequest.service.title}". Please rate your experience.`
      );
    }

    console.log('✅ Contract marked as completed:', contractId);
    return sendSuccess(res, { ...updatedContract, orderId }, 'Contract marked as completed successfully');
  } catch (error) {
    console.error('❌ Error in markCompleted:', error);
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    return sendError(res, 'Failed to mark contract as completed', 500);
  }
};

// Get all contracts for a user
export const getUserContracts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    console.log('🔍 getUserContracts called for user:', userId, 'role:', userRole);

    let whereClause: any = {};

    if (userRole === 'BUYER') {
      whereClause.buyerId = userId;
    } else if (userRole === 'STUDENT') {
      whereClause.studentId = userId;
    } else if (userRole === 'ADMIN') {
      // Admin can see all contracts
    } else {
      return sendError(res, 'Access denied', 403);
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
    const contractsWithParsedTerms = contracts.map(contract => {
      const parsedTerms = JSON.parse(contract.terms);
      return {
        ...contract,
        ...parsedTerms,
      };
    });

    console.log(`✅ Found ${contracts.length} contracts for user ${userId}`);
    return sendSuccess(res, contractsWithParsedTerms);
  } catch (error) {
    console.error('❌ Error in getUserContracts:', error);
    return sendError(res, 'Failed to fetch contracts', 500);
  }
};

