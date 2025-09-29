// User roles as string literals for SQLite compatibility
export type UserRole = 'BUYER' | 'STUDENT' | 'ADMIN';

export interface JWTPayload {
  userId: string;
  role: UserRole;
  jti: string; // JWT ID for refresh token tracking
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  userId: string;
  jti: string;
  iat: number;
  exp: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  bio?: string;
  skills?: string[];
}
