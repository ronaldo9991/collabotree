import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { sendSuccess, sendError, sendValidationError, sendNotFound } from '../utils/responses.js';
import { AuthenticatedRequest } from '../types/express.js';
import { createCursorPaginationResult } from '../utils/pagination.js';

// Schema for getting all messages (admin only)
const getAllMessagesSchema = z.object({
  cursor: z.string().optional(),
  limit: z.string().optional(),
  hireId: z.string().optional(),
  userId: z.string().optional(),
});

// Schema for managing top selections
const updateTopSelectionSchema = z.object({
  serviceId: z.string(),
  isTopSelection: z.boolean(),
});

// Schema for getting admin dashboard stats
const getAdminStatsSchema = z.object({
  period: z.enum(['day', 'week', 'month', 'year']).optional().default('week'),
});

export const getAllMessages = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Ensure user is admin
    if (!req.user || req.user.role !== 'ADMIN') {
      return sendError(res, 'Access denied. Admin role required.', 403);
    }

    const validatedData = getAllMessagesSchema.parse({
      ...req.query,
      ...req.params
    });
    const limit = Math.min(100, Math.max(1, parseInt(validatedData.limit as string) || 50));

    // Build where clause
    const where: any = {};
    
    if (validatedData.hireId) {
      where.room = {
        hireRequestId: validatedData.hireId
      };
    }

    if (validatedData.userId) {
      where.senderId = validatedData.userId;
    }

    // Build cursor condition
    const cursorCondition = validatedData.cursor ? {
      id: { lt: validatedData.cursor }
    } : {};

    const messages = await prisma.message.findMany({
      where: {
        ...where,
        ...cursorCondition,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        room: {
          include: {
            hireRequest: {
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
                  },
                },
              },
            },
          },
        },
        readBy: {
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
      orderBy: { createdAt: 'desc' }, // Most recent first
      take: limit + 1, // Take one extra to check if there are more
    });

    const hasMore = messages.length > limit;
    const result = hasMore ? messages.slice(0, limit) : messages;

    return sendSuccess(res, createCursorPaginationResult(result, limit));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    throw error;
  }
};

export const getAdminStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Ensure user is admin
    if (!req.user || req.user.role !== 'ADMIN') {
      return sendError(res, 'Access denied. Admin role required.', 403);
    }

    const validatedData = getAdminStatsSchema.parse(req.query);
    
    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    
    switch (validatedData.period) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get comprehensive stats
    const [
      totalUsers,
      totalStudents,
      totalBuyers,
      verifiedStudents,
      totalServices,
      activeServices,
      totalHireRequests,
      acceptedHireRequests,
      totalMessages,
      recentMessages,
      totalOrders,
      completedOrders,
      totalRevenue,
      pendingVerifications,
      topSelectionServices,
    ] = await Promise.all([
      // User stats
      prisma.user.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'BUYER' } }),
      prisma.user.count({ where: { role: 'STUDENT', isVerified: true } }),
      
      // Service stats
      prisma.service.count(),
      prisma.service.count({ where: { isActive: true } }),
      
      // Hire request stats
      prisma.hireRequest.count(),
      prisma.hireRequest.count({ where: { status: 'ACCEPTED' } }),
      
      // Message stats
      prisma.message.count(),
      prisma.message.count({ 
        where: { 
          createdAt: { gte: startDate } 
        } 
      }),
      
      // Order stats
      prisma.order.count(),
      prisma.order.count({ where: { status: 'COMPLETED' } }),
      
      // Revenue calculation
      prisma.order.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { priceCents: true },
      }),
      
      // Verification stats
      prisma.user.count({ 
        where: { 
          role: 'STUDENT', 
          isVerified: false 
        } 
      }),
      
      // Top selection services
      prisma.service.findMany({
        where: { isTopSelection: true },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              university: true,
              isVerified: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const stats = {
      users: {
        total: totalUsers,
        students: totalStudents,
        buyers: totalBuyers,
        verifiedStudents,
        pendingVerifications,
      },
      services: {
        total: totalServices,
        active: activeServices,
        topSelections: topSelectionServices.length,
      },
      hireRequests: {
        total: totalHireRequests,
        accepted: acceptedHireRequests,
      },
      messages: {
        total: totalMessages,
        recent: recentMessages,
      },
      orders: {
        total: totalOrders,
        completed: completedOrders,
      },
      revenue: {
        total: totalRevenue._sum.priceCents ? totalRevenue._sum.priceCents / 100 : 0,
      },
      topSelectionServices,
      period: validatedData.period,
    };

    return sendSuccess(res, stats);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    throw error;
  }
};

export const updateTopSelection = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Ensure user is admin
    if (!req.user || req.user.role !== 'ADMIN') {
      return sendError(res, 'Access denied. Admin role required.', 403);
    }

    const validatedData = updateTopSelectionSchema.parse(req.body);

    // Check if service exists
    const service = await prisma.service.findUnique({
      where: { id: validatedData.serviceId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            university: true,
            isVerified: true,
          },
        },
      },
    });

    if (!service) {
      return sendNotFound(res, 'Service not found');
    }

    // Update the service
    const updatedService = await prisma.service.update({
      where: { id: validatedData.serviceId },
      data: { isTopSelection: validatedData.isTopSelection },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            university: true,
            isVerified: true,
          },
        },
      },
    });

    return sendSuccess(res, updatedService, 
      `Service ${validatedData.isTopSelection ? 'added to' : 'removed from'} top selections`
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error.errors);
    }
    throw error;
  }
};

// Public version for homepage (no authentication required)
export const getPublicTopSelectionServices = async (req: any, res: Response) => {
  try {
    const services = await prisma.service.findMany({
      where: { isTopSelection: true },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            university: true,
            isVerified: true,
          },
        },
        _count: {
          select: {
            hireRequests: true,
            orders: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, services);
  } catch (error) {
    throw error;
  }
};

// Admin version (requires authentication)
export const getTopSelectionServices = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Ensure user is admin
    if (!req.user || req.user.role !== 'ADMIN') {
      return sendError(res, 'Access denied. Admin role required.', 403);
    }

    const services = await prisma.service.findMany({
      where: { isTopSelection: true },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            university: true,
            isVerified: true,
          },
        },
        _count: {
          select: {
            hireRequests: true,
            orders: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, services);
  } catch (error) {
    throw error;
  }
};

// Get full conversation for a specific service
export const getServiceConversation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Ensure user is admin
    if (!req.user || req.user.role !== 'ADMIN') {
      return sendError(res, 'Access denied. Admin role required.', 403);
    }

    const { serviceId } = req.params;

    if (!serviceId) {
      return sendError(res, 'Service ID is required.', 400);
    }

    // Get service details first
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            university: true,
            isVerified: true,
          },
        },
        hireRequests: {
          include: {
            buyer: {
              select: {
                id: true,
                name: true,
                university: true,
                isVerified: true,
              },
            },
            chatRoom: {
              include: {
                messages: {
                  include: {
                    sender: {
                      select: {
                        id: true,
                        name: true,
                        role: true,
                        university: true,
                        isVerified: true,
                      },
                    },
                  },
                  orderBy: { createdAt: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    if (!service) {
      return sendError(res, 'Service not found.', 404);
    }

    // Flatten all messages from all chat rooms for this service
    const allMessages = service.hireRequests.flatMap(hr => 
      hr.chatRoom?.messages.map(msg => ({
        ...msg,
        hireRequestId: hr.id,
        buyer: hr.buyer,
      })) || []
    );

    // Sort messages by creation time
    allMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return sendSuccess(res, {
      service: {
        id: service.id,
        title: service.title,
        description: service.description,
        priceCents: service.priceCents,
      },
      messages: allMessages,
      participants: {
        student: service.owner,
        buyers: service.hireRequests.map(hr => hr.buyer),
      },
    });
  } catch (error) {
    throw error;
  }
};

export const getAllServices = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Ensure user is admin
    if (!req.user || req.user.role !== 'ADMIN') {
      return sendError(res, 'Access denied. Admin role required.', 403);
    }

    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const offset = Math.max(0, parseInt(req.query.offset as string) || 0);

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              university: true,
              isVerified: true,
            },
          },
          _count: {
            select: {
              hireRequests: true,
              orders: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.service.count(),
    ]);

    return sendSuccess(res, {
      services,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    throw error;
  }
};
