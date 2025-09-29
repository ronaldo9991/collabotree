import { Response } from 'express';
import { prisma } from '../db/prisma.js';
import { sendSuccess, sendError } from '../utils/responses.js';
import { AuthenticatedRequest } from '../types/express.js';
import { parsePagination, createPaginationResult } from '../utils/pagination.js';

export const getWalletBalance = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const balance = await prisma.walletEntry.aggregate({
      where: { userId: req.user!.id },
      _sum: { amountCents: true }
    });

    const balanceCents = balance._sum.amountCents || 0;

    return sendSuccess(res, { 
      balanceCents,
      balanceDollars: balanceCents / 100 
    });
  } catch (error) {
    throw error;
  }
};

export const getWalletEntries = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const pagination = parsePagination(req.query);

    const [entries, total] = await Promise.all([
      prisma.walletEntry.findMany({
        where: { userId: req.user!.id },
        orderBy: { createdAt: 'desc' },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.walletEntry.count({
        where: { userId: req.user!.id }
      }),
    ]);

    const result = createPaginationResult(entries, pagination, total);

    return sendSuccess(res, result);
  } catch (error) {
    throw error;
  }
};
