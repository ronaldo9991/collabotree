import { prisma } from '../db/prisma.js';
import { NotificationType } from '@prisma/client';

export const createNotification = async (
  userId: string,
  type: NotificationType | string,
  title: string,
  body?: string
) => {
  return prisma.notification.create({
    data: {
      userId,
      type: type as NotificationType,
      title,
      body,
    },
  });
};

export const createNotificationForUsers = async (
  userIds: string[],
  type: NotificationType | string,
  title: string,
  body?: string
) => {
  const notifications = userIds.map(userId => ({
    userId,
    type: type as NotificationType,
    title,
    body,
  }));

  return prisma.notification.createMany({
    data: notifications,
  });
};

export const markNotificationAsRead = async (notificationId: string, userId: string) => {
  return prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
    },
    data: {
      read: true,
    },
  });
};

export const markAllNotificationsAsRead = async (userId: string) => {
  return prisma.notification.updateMany({
    where: {
      userId,
      read: false,
    },
    data: {
      read: true,
    },
  });
};

export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  return prisma.notification.count({
    where: {
      userId,
      read: false,
    },
  });
};
