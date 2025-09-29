import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { hashPassword, verifyPassword, validatePasswordStrength } from '../utils/passwords.js';
import { generateTokenPair, verifyRefreshToken, hashRefreshToken } from '../utils/tokens.js';
import { sendSuccess, sendCreated, sendError, sendUnauthorized, sendConflict } from '../utils/responses.js';
import { registerSchema, loginSchema, refreshTokenSchema, logoutSchema } from '../validations/auth.js';
import { createNotification } from '../domain/notifications.js';
import { UserRole } from '../types/auth.js';

export const register = async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    
    // Validate password strength
    const passwordValidation = validatePasswordStrength(validatedData.password);
    if (!passwordValidation.isValid) {
      return sendError(res, 'Password validation failed', 422, passwordValidation.errors);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { 
        OR: [
          { email: validatedData.email },
          ...(validatedData.username ? [{ username: validatedData.username }] : [])
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === validatedData.email) {
        return sendConflict(res, 'User with this email already exists');
      }
      if (existingUser.username === validatedData.username) {
        return sendConflict(res, 'Username already taken');
      }
    }

    // Hash password
    const passwordHash = await hashPassword(validatedData.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        passwordHash,
        name: validatedData.name,
        username: validatedData.username,
        role: validatedData.role,
        university: validatedData.university,
        bio: validatedData.bio,
        skills: JSON.stringify(validatedData.skills || []),
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        role: true,
        university: true,
        bio: true,
        skills: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = generateTokenPair(user.id, user.role as UserRole);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        hashedToken: hashRefreshToken(tokens.refreshToken),
        jti: tokens.refreshToken.split('.')[2], // Extract JTI from token
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Create welcome notification
    await createNotification(
      user.id,
      'ORDER_CREATED', // Using existing type for welcome
      'Welcome to CollaboTree!',
      'Your account has been created successfully. Start exploring services or create your own!'
    );

    return sendCreated(res, {
      user,
      ...tokens,
    }, 'User registered successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 'Validation failed', 422, error.errors);
    }
    throw error;
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (!user) {
      return sendUnauthorized(res, 'Invalid email or password');
    }

    // Verify password
    const isValidPassword = await verifyPassword(validatedData.password, user.passwordHash);
    if (!isValidPassword) {
      return sendUnauthorized(res, 'Invalid email or password');
    }

    // Generate tokens
    const tokens = generateTokenPair(user.id, user.role as UserRole);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        hashedToken: hashRefreshToken(tokens.refreshToken),
        jti: tokens.refreshToken.split('.')[2], // Extract JTI from token
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Return user data without password
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      role: user.role,
      bio: user.bio,
      skills: user.skills,
      createdAt: user.createdAt,
    };

    return sendSuccess(res, {
      user: userData,
      ...tokens,
    }, 'Login successful');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 'Validation failed', 422, error.errors);
    }
    throw error;
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const validatedData = refreshTokenSchema.parse(req.body);

    // Verify refresh token
    const payload = verifyRefreshToken(validatedData.refreshToken);
    
    // Find and verify stored refresh token
    const storedToken = await prisma.refreshToken.findUnique({
      where: { jti: payload.jti },
      include: { user: true }
    });

    if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
      return sendUnauthorized(res, 'Invalid or expired refresh token');
    }

    // Verify token hash
    const tokenHash = hashRefreshToken(validatedData.refreshToken);
    if (storedToken.hashedToken !== tokenHash) {
      return sendUnauthorized(res, 'Invalid refresh token');
    }

    // Revoke old token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true }
    });

    // Generate new tokens
    const tokens = generateTokenPair(storedToken.user.id, storedToken.user.role as UserRole);

    // Store new refresh token
    await prisma.refreshToken.create({
      data: {
        userId: storedToken.user.id,
        hashedToken: hashRefreshToken(tokens.refreshToken),
        jti: tokens.refreshToken.split('.')[2],
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return sendSuccess(res, tokens, 'Token refreshed successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 'Validation failed', 422, error.errors);
    }
    throw error;
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const validatedData = logoutSchema.parse(req.body);

    if (validatedData.refreshToken) {
      // Verify and revoke refresh token
      const payload = verifyRefreshToken(validatedData.refreshToken);
      
      await prisma.refreshToken.updateMany({
        where: { jti: payload.jti },
        data: { revoked: true }
      });
    }

    return sendSuccess(res, null, 'Logout successful');
  } catch (error) {
    // Don't throw error for invalid tokens during logout
    return sendSuccess(res, null, 'Logout successful');
  }
};
