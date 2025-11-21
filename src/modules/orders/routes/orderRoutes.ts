import { Hono } from 'hono';
import { authenticate } from '@shared/middleware/auth.js';

const orderRoutes = new Hono();

orderRoutes.get('/', authenticate(), async (c) => {
  return c.json({ data: [] });
});

orderRoutes.post('/', authenticate(), async (c) => {
  const body = await c.req.json();
  return c.json({ data: { orderId: 'order-123' } }, 201);
});

orderRoutes.get('/:id', authenticate(), async (c) => {
  const id = c.req.param('id');
  return c.json({ data: { id, orderNumber: 'ORD-123' } });
});

export { orderRoutes };
