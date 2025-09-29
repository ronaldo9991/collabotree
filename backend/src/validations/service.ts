import { z } from 'zod';

export const createServiceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description is too long'),
  priceCents: z.number().int().min(100, 'Price must be at least $1.00').max(10000000, 'Price is too high'), // $0.01 to $100,000
  coverImage: z.string().optional(), // Add cover image validation
  isActive: z.boolean().optional().default(true),
});

export const updateServiceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description is too long').optional(),
  priceCents: z.number().int().min(100, 'Price must be at least $1.00').max(10000000, 'Price is too high').optional(),
  coverImage: z.string().optional(), // Add cover image validation
  isActive: z.boolean().optional(),
});

export const getServiceSchema = z.object({
  id: z.string().cuid('Invalid service ID'),
});

export const getServicesSchema = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  q: z.string().optional(),
  minPrice: z.string().transform(Number).optional(),
  maxPrice: z.string().transform(Number).optional(),
  sortBy: z.enum(['createdAt', 'priceCents', 'title']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  ownerId: z.string().cuid().optional(),
});

export type CreateServiceData = z.infer<typeof createServiceSchema>;
export type UpdateServiceData = z.infer<typeof updateServiceSchema>;
export type GetServiceData = z.infer<typeof getServiceSchema>;
export type GetServicesData = z.infer<typeof getServicesSchema>;
