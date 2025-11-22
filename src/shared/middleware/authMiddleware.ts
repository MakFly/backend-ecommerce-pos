import { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';

/**
 * JWT Payload Interface
 */
export interface JWTPayload {
  userId: string;
  email: string;
  roles: string[];
}

/**
 * Extended Context with User Info
 */
export interface AuthContext extends Context {
  user?: JWTPayload;
}

/**
 * JWT Authentication Middleware
 *
 * Verifies JWT token and attaches user info to context
 *
 * Usage:
 * ```typescript
 * app.get('/protected', authMiddleware, async (c) => {
 *   const user = c.get('user');
 *   return c.json({ user });
 * });
 * ```
 */
export async function authMiddleware(c: Context, next: Next) {
  try {
    // 1. Get token from Authorization header
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'No token provided' }, 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // 2. Verify token
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret-change-me'
    ) as JWTPayload;

    // 3. Attach user info to context
    c.set('user', payload);

    // 4. Continue to next middleware/handler
    await next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return c.json({ error: 'Invalid token' }, 401);
    }
    if (error instanceof jwt.TokenExpiredError) {
      return c.json({ error: 'Token expired' }, 401);
    }
    return c.json({ error: 'Authentication failed' }, 401);
  }
}

/**
 * Optional Auth Middleware
 *
 * Like authMiddleware but doesn't fail if no token provided
 * Useful for endpoints that work differently for authenticated users
 */
export async function optionalAuthMiddleware(c: Context, next: Next) {
  try {
    const authHeader = c.req.header('Authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      try {
        const payload = jwt.verify(
          token,
          process.env.JWT_SECRET || 'secret-change-me'
        ) as JWTPayload;

        c.set('user', payload);
      } catch {
        // Invalid token, but we don't fail - just continue without user
      }
    }

    await next();
  } catch (error) {
    // Continue even if error
    await next();
  }
}

/**
 * Role-based Authorization Middleware Factory
 *
 * Checks if user has one of the required roles
 *
 * Usage:
 * ```typescript
 * app.get('/admin', authMiddleware, requireRoles(['admin']), async (c) => {
 *   // Only admins can access this
 * });
 * ```
 */
export function requireRoles(requiredRoles: string[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user') as JWTPayload | undefined;

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user has any of the required roles
    const hasRole = user.roles.some((role) => requiredRoles.includes(role));

    if (!hasRole) {
      return c.json(
        {
          error: 'Forbidden',
          message: `Required roles: ${requiredRoles.join(', ')}`,
        },
        403
      );
    }

    await next();
  };
}

/**
 * Permission-based Authorization Middleware Factory
 *
 * Checks if user has specific permission
 *
 * Usage:
 * ```typescript
 * app.delete('/products/:id', authMiddleware, requirePermission('products:delete'), async (c) => {
 *   // Only users with products:delete permission can access this
 * });
 * ```
 */
export function requirePermission(permission: string) {
  return async (c: Context, next: Next) => {
    const user = c.get('user') as JWTPayload | undefined;

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // TODO: Fetch user's permissions from database and check
    // For now, admins have all permissions
    if (user.roles.includes('admin')) {
      await next();
      return;
    }

    return c.json(
      {
        error: 'Forbidden',
        message: `Required permission: ${permission}`,
      },
      403
    );
  };
}
