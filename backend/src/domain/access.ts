import { prisma } from '../db/prisma.js';

export const isServiceOwner = async (userId: string, serviceId: string): Promise<boolean> => {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: { ownerId: true }
  });
  
  return service?.ownerId === userId;
};

export const isHireParticipant = async (userId: string, hireId: string): Promise<boolean> => {
  const hire = await prisma.hireRequest.findUnique({
    where: { id: hireId },
    select: { buyerId: true, studentId: true }
  });
  
  if (!hire) return false;
  
  return hire.buyerId === userId || hire.studentId === userId;
};

export const isOrderParticipant = async (userId: string, orderId: string): Promise<boolean> => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { buyerId: true, studentId: true }
  });
  
  if (!order) return false;
  
  return order.buyerId === userId || order.studentId === userId;
};

export const canCreateOrderForService = async (buyerId: string, serviceId: string): Promise<boolean> => {
  // Check if buyer has already purchased this service
  const existingOrder = await prisma.order.findUnique({
    where: {
      unique_buyer_service_order: {
        buyerId,
        serviceId
      }
    }
  });
  
  return !existingOrder; // Can create if no existing order
};

export const canReviewOrder = async (userId: string, orderId: string): Promise<boolean> => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { 
      buyerId: true, 
      studentId: true, 
      status: true,
      reviews: {
        where: { reviewerId: userId },
        select: { id: true }
      }
    }
  });
  
  if (!order) return false;
  
  // Can only review completed orders
  if (order.status !== 'COMPLETED') return false;
  
  // Can only review if you're a participant
  if (order.buyerId !== userId && order.studentId !== userId) return false;
  
  // Can only review once per order
  if (order.reviews.length > 0) return false;
  
  return true;
};

export const canCreateDispute = async (userId: string, orderId: string): Promise<boolean> => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { 
      buyerId: true, 
      studentId: true, 
      status: true,
      disputes: {
        where: { raisedById: userId },
        select: { id: true }
      }
    }
  });
  
  if (!order) return false;
  
  // Can only dispute orders that are in progress or delivered
  if (!['IN_PROGRESS', 'DELIVERED'].includes(order.status)) return false;
  
  // Can only dispute if you're a participant
  if (order.buyerId !== userId && order.studentId !== userId) return false;
  
  // Can only create one dispute per order
  if (order.disputes.length > 0) return false;
  
  return true;
};
