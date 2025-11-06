import { prisma } from '../db/prisma.js';
import type { PrismaClient } from '@prisma/client';

/**
 * Generate a unique 4-digit order number
 * Format: 1000-9999
 * @param tx Optional transaction client - if provided, uses transaction client for uniqueness check
 */
export async function generateOrderNumber(tx?: PrismaClient): Promise<string> {
  const client = tx || prisma;
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    // Generate a random 4-digit number between 1000 and 9999
    const orderNumber = Math.floor(1000 + Math.random() * 9000).toString();

    // Check if this order number already exists
    const existing = await client.order.findUnique({
      where: { orderNumber },
      select: { id: true },
    });

    if (!existing) {
      return orderNumber;
    }

    attempts++;
  }

  // Fallback: use timestamp-based number if all random attempts fail
  const timestamp = Date.now();
  const fallbackNumber = (timestamp % 9000 + 1000).toString();
  
  // Double-check fallback
  const existing = await client.order.findUnique({
    where: { orderNumber: fallbackNumber },
    select: { id: true },
  });

  if (!existing) {
    return fallbackNumber;
  }

  // Last resort: sequential check
  for (let i = 1000; i <= 9999; i++) {
    const sequentialNumber = i.toString();
    const existing = await client.order.findUnique({
      where: { orderNumber: sequentialNumber },
      select: { id: true },
    });
    if (!existing) {
      return sequentialNumber;
    }
  }

  throw new Error('Unable to generate unique order number');
}

