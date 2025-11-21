import { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError.js';

export interface JWTPayload {
  userId: string;
  email: string;
  roles: string[];
}

declare module 'hono' {
  interface ContextVariableMap {
    user: JWTPayload;
  }
}

export function authenticate() {
  return async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
      c.set('user', payload);
      await next();
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  };
}

export function authorize(...allowedRoles: string[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');

    if (!user) {
      throw new UnauthorizedError();
    }

    const hasRole = user.roles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenError('Insufficient permissions');
    }

    await next();
  };
}
