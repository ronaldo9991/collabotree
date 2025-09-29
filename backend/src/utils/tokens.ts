import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { JWTPayload, RefreshTokenPayload, AuthTokens, UserRole } from '../types/auth.js';

export const generateJTI = (): string => {
  return crypto.randomUUID();
};

export const generateAccessToken = (userId: string, role: UserRole, jti: string): string => {
  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId,
    role,
    jti,
  };

  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const generateRefreshToken = (userId: string, jti: string): string => {
  const payload: Omit<RefreshTokenPayload, 'iat' | 'exp'> = {
    userId,
    jti,
  };

  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const generateTokenPair = (userId: string, role: UserRole): AuthTokens => {
  const jti = generateJTI();
  
  return {
    accessToken: generateAccessToken(userId, role, jti),
    refreshToken: generateRefreshToken(userId, jti),
  };
};

export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

export const hashRefreshToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
