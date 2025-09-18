import { prisma } from '../db/prisma.js';

export const createNotification = async (
  userId: string,
  type: string,
  title: string,
  body?: string
) => {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      body,
    },
  });
};

export const createNotificationForUsers = async (
  userIds: string[],
  type: string,
  title: string,
  body?: string
) => {
  const notifications = userIds.map(userId => ({
    userId,
    type,
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
