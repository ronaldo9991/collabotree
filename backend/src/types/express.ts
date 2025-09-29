import { Request } from 'express';
import { UserRole } from './auth.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  cursor?: string;
}

export interface SearchQuery {
  q?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
