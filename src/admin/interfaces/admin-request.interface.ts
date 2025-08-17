import { Request } from 'express';

/**
 * Interface para request autenticado con usuario admin
 */
export interface AdminAuthenticatedRequest extends Request {
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    permissions: string[];
    sub: string; // JWT subject (user ID)
  };
}

/**
 * Interface para request con usuario validado por estrategia local
 */
export interface AdminLocalAuthRequest extends Request {
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    permissions: string[];
    isActive: boolean;
    lastLogin?: Date;
    createdAt?: Date;
    updatedAt?: Date;
  };
}
