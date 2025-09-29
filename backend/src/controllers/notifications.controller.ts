import { Response } from 'express';
import { prisma } from '../db/prisma.js';
import { sendSuccess, sendError } from '../utils/responses.js';
import { AuthenticatedRequest } from '../types/express.js';
import { parsePagination, createPaginationResult } from '../utils/pagination.js';
import { 
  markNotificationAsRead as markNotificationAsReadDomain, 
  markAllNotificationsAsRead as markAllNotificationsAsReadDomain, 
  getUnreadNotificationCount as getUnreadNotificationCountDomain 
} from '../domain/notifications.js';

export const getNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const pagination = parsePagination(req.query);

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: req.user!.id },
        orderBy: [
          { read: 'asc' }, // Unread first
          { createdAt: 'desc' }
        ],
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.notification.count({
        where: { userId: req.user!.id }
      }),
      getUnreadNotificationCountDomain(req.user!.id),
    ]);

    const result = createPaginationResult(notifications, pagination, total);

    return sendSuccess(res, {
      ...result,
      unreadCount,
    });
  } catch (error) {
    throw error;
  }
};

export const markNotificationAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const notificationId = req.params.id;

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { userId: true }
    });

    if (!notification) {
      return sendError(res, 'Notification not found', 404);
    }

    if (notification.userId !== req.user!.id) {
      return sendError(res, 'Access denied', 403);
    }

    await markNotificationAsReadDomain(notificationId, req.user!.id);

    return sendSuccess(res, null, 'Notification marked as read');
  } catch (error) {
    throw error;
  }
};

export const markAllNotificationsAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    await markAllNotificationsAsReadDomain(req.user!.id);

    return sendSuccess(res, null, 'All notifications marked as read');
  } catch (error) {
    throw error;
  }
};

export const getUnreadNotificationCount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const count = await getUnreadNotificationCountDomain(req.user!.id);

    return sendSuccess(res, { unreadCount: count });
  } catch (error) {
    throw error;
  }
};
