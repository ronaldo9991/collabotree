import { z } from 'zod';
import { UserRole } from '../types/auth.js';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/\d/, 'Password must contain at least one number'),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username is too long').regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores').optional(),
  role: z.enum(['BUYER', 'STUDENT', 'ADMIN']).optional().default('BUYER'),
  university: z.string().max(100, 'University name is too long').optional(),
  bio: z.string().max(500, 'Bio is too long').optional(),
  skills: z.array(z.string()).max(20, 'Too many skills').optional().default([]),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const logoutSchema = z.object({
  refreshToken: z.string().optional(),
});

export type RegisterData = z.infer<typeof registerSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type RefreshTokenData = z.infer<typeof refreshTokenSchema>;
export type LogoutData = z.infer<typeof logoutSchema>;
