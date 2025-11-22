import { Context, Next } from 'hono';
import { z, ZodSchema } from 'zod';

/**
 * Validation Middleware Factory
 *
 * Creates middleware that validates request body against a Zod schema
 *
 * Usage:
 * ```typescript
 * app.post('/endpoint', validate(MySchema), async (c) => {
 *   const body = await c.req.json(); // Already validated!
 *   // ...
 * });
 * ```
 */
export function validate(schema: ZodSchema) {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json();
      const validated = schema.parse(body);

      // Store validated data in context for use in handler
      c.set('validatedData', validated);

      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json(
          {
            error: 'Validation failed',
            details: error.errors.map((err) => ({
              path: err.path.join('.'),
              message: err.message,
            })),
          },
          400
        );
      }
      return c.json({ error: 'Invalid request body' }, 400);
    }
  };
}

/**
 * Query Validation Middleware Factory
 *
 * Validates query parameters instead of body
 */
export function validateQuery(schema: ZodSchema) {
  return async (c: Context, next: Next) => {
    try {
      const query = c.req.query();
      const validated = schema.parse(query);

      c.set('validatedQuery', validated);

      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json(
          {
            error: 'Query validation failed',
            details: error.errors.map((err) => ({
              path: err.path.join('.'),
              message: err.message,
            })),
          },
          400
        );
      }
      return c.json({ error: 'Invalid query parameters' }, 400);
    }
  };
}
