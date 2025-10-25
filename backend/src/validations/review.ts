import { z } from 'zod';

export const createReviewSchema = z.object({
  orderId: z.string().cuid('Invalid order ID'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().max(1000, 'Comment is too long').optional(),
});

export const getReviewsSchema = z.object({
  userId: z.string().cuid('Invalid user ID'),
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
});

export type CreateReviewData = z.infer<typeof createReviewSchema>;
export type GetReviewsData = z.infer<typeof getReviewsSchema>;
