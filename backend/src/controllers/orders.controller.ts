import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { sendSuccess, sendCreated, sendError, sendValidationError, sendNotFound, sendConflict } from '../utils/responses.js';
import { createOrderSchema, updateOrderStatusSchema, getOrderSchema, getOrdersSchema, payOrderSchema } from '../validations/order.js';
import { AuthenticatedRequest } from '../types/express.js';
import { parsePagination, createPaginationResult } from '../utils/pagination.js';
import { createNotification, createNotificationForUsers } from '../domain/notifications.js';
// NotificationType removed - using string literals

export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = createOrderSchema.parse(req.body);

    // Get hire request details
    const hireRequest = await prisma.hireRequest.findUnique({
      where: { id: validatedData.hireRequestId },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            ownerId: true,
            priceCents: true,
          },
        },
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
      },
    });

    if (!hireRequest) {
      return sendNotFound(res, 'Hire request not found');
    }

    if (hireRequest.status !== 'ACCEPTED') {
      return sendError(res, 'Order can only be created from accepted hire requests', 400);
    }

    if (hireRequest.buyerId !== req.user!.id) {
      return sendError(res, 'Access denied', 403);
    }

    // CRITICAL: Check if buyer has already purchased this service
    const existingOrder = await prisma.order.findUnique({
      where: {
        unique_buyer_service_order: {
          buyerId: req.user!.id,
          serviceId: hireRequest.service.id,
        },
      },
    });

    if (existingOrder) {
      return sendConflict(res, 'Buyer has already purchased this service');
    }

    // Create order in transaction to ensure atomicity
    const order = await prisma.$transaction(async (tx) => {
      // Double-check the constraint within the transaction
      const existingOrderInTx = await tx.order.findUnique({
        where: {
          unique_buyer_service_order: {
            buyerId: req.user!.id,
            serviceId: hireRequest.service.id,
          },
        },
      });

      if (existingOrderInTx) {
        throw new Error('Buyer has already purchased this service');
      }

      // Create the order
      return tx.order.create({
        data: {
          buyerId: hireRequest.buyerId,
          studentId: hireRequest.studentId,
          serviceId: hireRequest.service.id,
          hireRequestId: hireRequest.id,
          priceCents: hireRequest.priceCents || hireRequest.service.priceCents,
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
          service: {
            select: {
              id: true,
              title: true,
              description: true,
              priceCents: true,
            },
          },
          hireRequest: {
            select: {
              id: true,
              message: true,
            },
          },
        },
      });
    });

    // Create notifications
    await createNotificationForUsers(
      [hireRequest.buyerId, hireRequest.studentId],
      'ORDER_CREATED',
      'New Order Created',
      `A new order has been created for "${hireRequest.service.title}"`
    );

    return sendCreated(res, order, 'Order created successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    if (error instanceof Error && error.message === 'Buyer has already purchased this service') {
      return sendConflict(res, error.message);
    }
    throw error;
  }
};

export const getOrders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = getOrdersSchema.parse(req.query);
    const pagination = parsePagination(validatedData);

    // Build where clause based on user role
    const where: any = {};

    if (req.user!.role === 'BUYER') {
      where.buyerId = req.user!.id;
    } else if (req.user!.role === 'STUDENT') {
      where.studentId = req.user!.id;
    } else if (req.user!.role === 'ADMIN') {
      // Admin can see all orders
    } else {
      return sendError(res, 'Access denied', 403);
    }

    if (validatedData.status) {
      where.status = validatedData.status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
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
        orderBy: { createdAt: 'desc' },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.order.count({ where }),
    ]);

    const result = createPaginationResult(orders, pagination, total);

    return sendSuccess(res, result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    throw error;
  }
};

export const getOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = getOrderSchema.parse(req.params);

    const order = await prisma.order.findUnique({
      where: { id: validatedData.id },
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
        hireRequest: {
          select: {
            id: true,
            message: true,
          },
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return sendNotFound(res, 'Order not found');
    }

    // Check access
    if (order.buyerId !== req.user!.id && 
        order.studentId !== req.user!.id && 
        req.user!.role !== 'ADMIN') {
      return sendError(res, 'Access denied', 403);
    }

    return sendSuccess(res, order);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    throw error;
  }
};

export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = updateOrderStatusSchema.parse(req.body);
    const orderId = req.params.id;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
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

    // Check access and status transition rules
    const canUpdate = 
      (req.user!.role === 'ADMIN') ||
      (req.user!.id === order.studentId && ['IN_PROGRESS', 'DELIVERED'].includes(validatedData.status)) ||
      (req.user!.id === order.buyerId && ['COMPLETED', 'CANCELLED'].includes(validatedData.status));

    if (!canUpdate) {
      return sendError(res, 'Access denied or invalid status transition', 403);
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      PENDING: ['PAID', 'CANCELLED'],
      PAID: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['DELIVERED', 'CANCELLED'],
      DELIVERED: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: [],
      DISPUTED: ['COMPLETED', 'CANCELLED'],
    };

    if (!validTransitions[order.status]?.includes(validatedData.status)) {
      return sendError(res, `Invalid status transition from ${order.status} to ${validatedData.status}`, 400);
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status: validatedData.status },
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

      // If order is completed, credit the student's wallet
      if (validatedData.status === 'COMPLETED') {
        await tx.walletEntry.create({
          data: {
            userId: order.studentId,
            amountCents: order.priceCents,
            reason: `Payment for order: ${order.service.title}`,
          },
        });
      }

      return updated;
    });

    // Create notifications
    const otherPartyId = order.buyerId === req.user!.id ? order.studentId : order.buyerId;
    
    await createNotification(
      otherPartyId,
      'ORDER_STATUS_CHANGED',
      'Order Status Updated',
      `Order for "${order.service.title}" status changed to ${validatedData.status}`
    );

    return sendSuccess(res, updatedOrder, 'Order status updated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    throw error;
  }
};

export const payOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = payOrderSchema.parse(req.body);
    const orderId = req.params.id;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
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

    if (order.buyerId !== req.user!.id) {
      return sendError(res, 'Access denied', 403);
    }

    if (order.status !== 'PENDING') {
      return sendError(res, 'Order is not pending payment', 400);
    }

    // In a real implementation, you would integrate with a payment processor here
    // For now, we'll just simulate successful payment
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'PAID' },
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

    // Create notification for student
    await createNotification(
      order.studentId,
      'ORDER_STATUS_CHANGED',
      'Order Payment Received',
      `Payment received for order: "${order.service.title}"`
    );

    return sendSuccess(res, updatedOrder, 'Order payment processed successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    throw error;
  }
};
