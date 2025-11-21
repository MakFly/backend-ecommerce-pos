import { Hono } from 'hono';
import { authenticate } from '@shared/middleware/auth.js';

const customerRoutes = new Hono();

customerRoutes.get('/', authenticate(), async (c) => {
  return c.json({ data: [] });
});

customerRoutes.post('/', authenticate(), async (c) => {
  const body = await c.req.json();
  return c.json({ data: { id: 'customer-123' } }, 201);
});

customerRoutes.get('/:id', authenticate(), async (c) => {
  const id = c.req.param('id');
  return c.json({ data: { id, email: 'customer@example.com' } });
});

export { customerRoutes };
