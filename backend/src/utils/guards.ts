import { Response, NextFunction } from 'express';
import { UserRole } from '../types/auth.js';
import { AuthenticatedRequest } from '../types/express.js';
import { prisma } from '../db/prisma.js';

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

export const requireRole = (roles: UserRole | UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

export const requireSelfOrAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const targetUserId = req.params.id || req.params.userId;
  
  if (req.user.id === targetUserId || req.user.role === 'ADMIN') {
    return next();
  }
  
  return res.status(403).json({ error: 'Access denied' });
};

export const requireServiceOwner = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const serviceId = req.params.id || req.params.serviceId;
  
  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { ownerId: true }
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    if (service.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const requireHireParticipant = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const hireId = req.params.id || req.params.hireId;
  
  try {
    const hire = await prisma.hireRequest.findUnique({
      where: { id: hireId },
      select: { buyerId: true, studentId: true }
    });

    if (!hire) {
      return res.status(404).json({ error: 'Hire request not found' });
    }

    if (hire.buyerId !== req.user.id && hire.studentId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const requireOrderParticipant = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const orderId = req.params.id || req.params.orderId;
  
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { buyerId: true, studentId: true }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.buyerId !== req.user.id && order.studentId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};
