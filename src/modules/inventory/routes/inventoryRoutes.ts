import { Hono } from 'hono';
import { authenticate, authorize } from '@shared/middleware/auth.js';

const inventoryRoutes = new Hono();

inventoryRoutes.get('/stock/:variantId', authenticate(), async (c) => {
  const variantId = c.req.param('variantId');
  return c.json({
    data: {
      variantId,
      available: 100,
      reserved: 5,
      total: 105,
    },
  });
});

inventoryRoutes.post('/adjust', authenticate(), authorize('ADMIN', 'STAFF'), async (c) => {
  const body = await c.req.json();
  return c.json({ message: 'Stock adjusted' });
});

export { inventoryRoutes };
