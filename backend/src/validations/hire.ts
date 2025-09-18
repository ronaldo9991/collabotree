import { z } from 'zod';

export const createHireRequestSchema = z.object({
  serviceId: z.string().cuid('Invalid service ID'),
  message: z.string().max(1000, 'Message is too long').optional(),
  priceCents: z.number().int().min(100, 'Price must be at least $1.00').max(10000000, 'Price is too high').optional(),
});

export const updateHireRequestSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED', 'CANCELLED']),
});

export const getHireRequestSchema = z.object({
  id: z.string().cuid('Invalid hire request ID'),
});

export const getHireRequestsSchema = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED']).optional(),
  role: z.enum(['buyer', 'student']).optional(),
});

export type CreateHireRequestData = z.infer<typeof createHireRequestSchema>;
export type UpdateHireRequestData = z.infer<typeof updateHireRequestSchema>;
export type GetHireRequestData = z.infer<typeof getHireRequestSchema>;
export type GetHireRequestsData = z.infer<typeof getHireRequestsSchema>;
