import { z } from 'zod';

export const createOrderSchema = z.object({
  hireRequestId: z.string().cuid('Invalid hire request ID'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PAID', 'IN_PROGRESS', 'DELIVERED', 'COMPLETED', 'CANCELLED']),
});

export const getOrderSchema = z.object({
  id: z.string().cuid('Invalid order ID'),
});

export const getOrdersSchema = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  status: z.enum(['PENDING', 'PAID', 'IN_PROGRESS', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'DISPUTED']).optional(),
  role: z.enum(['buyer', 'student']).optional(),
});

export const payOrderSchema = z.object({
  paymentMethod: z.string().optional(),
  paymentDetails: z.record(z.any()).optional(),
});

export type CreateOrderData = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusData = z.infer<typeof updateOrderStatusSchema>;
export type GetOrderData = z.infer<typeof getOrderSchema>;
export type GetOrdersData = z.infer<typeof getOrdersSchema>;
export type PayOrderData = z.infer<typeof payOrderSchema>;
