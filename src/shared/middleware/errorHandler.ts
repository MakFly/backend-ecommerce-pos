import { Context } from 'hono';
import { AppError } from '../errors/AppError.js';
import { ZodError } from 'zod';

/**
 * Global Error Handler Middleware
 *
 * Handles all errors thrown in the application with:
 * - Structured logging
 * - Different error types (AppError, ZodError, JWT, etc.)
 * - Production-safe error responses (no stack traces in prod)
 * - Request tracing support
 *
 * Usage: app.onError(errorHandler);
 */
export async function errorHandler(err: Error, c: Context) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const requestId = c.req.header('x-request-id') || generateRequestId();

  // Structured error logging
  console.error('[ERROR]', {
    requestId,
    timestamp: new Date().toISOString(),
    method: c.req.method,
    path: c.req.path,
    error: {
      name: err.name,
      message: err.message,
      stack: isDevelopment ? err.stack : undefined,
    },
  });

  // Handle AppError (our custom errors)
  if (err instanceof AppError) {
    return c.json(
      {
        error: {
          code: err.code || 'APPLICATION_ERROR',
          message: err.message,
          details: isDevelopment ? err.details : undefined,
          requestId,
        },
      },
      err.statusCode
    );
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return c.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: isDevelopment
            ? err.errors.map((e) => ({
                path: e.path.join('.'),
                message: e.message,
              }))
            : undefined,
          requestId,
        },
      },
      400
    );
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return c.json(
      {
        error: {
          code: 'INVALID_TOKEN',
          message: err.name === 'TokenExpiredError' ? 'Token has expired' : 'Invalid token',
          requestId,
        },
      },
      401
    );
  }

  // Handle database errors (PostgreSQL)
  if (err.message.includes('violates') || err.message.includes('constraint')) {
    return c.json(
      {
        error: {
          code: 'DATABASE_CONSTRAINT_ERROR',
          message: 'Database constraint violation',
          details: isDevelopment ? err.message : undefined,
          requestId,
        },
      },
      409
    );
  }

  // Handle generic errors (500)
  // In production, hide error details for security
  return c.json(
    {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: isDevelopment ? err.message : 'An unexpected error occurred',
        stack: isDevelopment ? err.stack : undefined,
        requestId,
      },
    },
    500
  );
}

/**
 * Generate a simple request ID for tracing
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}
