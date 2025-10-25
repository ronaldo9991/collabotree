import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express.js';
import { prisma } from '../db/prisma.js';

export const requireAcceptedHire = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const hireId = req.params.hireId || req.params.id;
  
  if (!hireId) {
    return res.status(400).json({ error: 'Hire ID is required' });
  }

  try {
    const hire = await prisma.hireRequest.findUnique({
      where: { id: hireId },
      select: {
        id: true,
        buyerId: true,
        studentId: true,
        status: true,
      },
    });

    if (!hire) {
      return res.status(404).json({ error: 'Hire request not found' });
    }

    if (hire.status !== 'ACCEPTED') {
      return res.status(403).json({ 
        error: 'Chat is only available for accepted hire requests' 
      });
    }

    // Check if user is a participant in this hire request
    if (hire.buyerId !== req.user.id && hire.studentId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Attach hire info to request for use in controllers
    req.hireRequest = hire;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Extend the AuthenticatedRequest interface to include hireRequest
declare global {
  namespace Express {
    interface Request {
      hireRequest?: {
        id: string;
        buyerId: string;
        studentId: string;
        status: string;
      };
    }
  }
}
