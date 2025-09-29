import { z } from 'zod';

export const createDisputeSchema = z.object({
  orderId: z.string().cuid('Invalid order ID'),
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description is too long'),
});

export const updateDisputeStatusSchema = z.object({
  status: z.enum(['UNDER_REVIEW', 'RESOLVED', 'REJECTED']),
});

export const getDisputeSchema = z.object({
  id: z.string().cuid('Invalid dispute ID'),
});

export const getDisputesSchema = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  status: z.enum(['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED']).optional(),
});

export type CreateDisputeData = z.infer<typeof createDisputeSchema>;
export type UpdateDisputeStatusData = z.infer<typeof updateDisputeStatusSchema>;
export type GetDisputeData = z.infer<typeof getDisputeSchema>;
export type GetDisputesData = z.infer<typeof getDisputesSchema>;
