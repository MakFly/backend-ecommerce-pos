import { Hono } from 'hono';
import { authenticate, authorize } from '@shared/middleware/auth.js';

const webhookRoutes = new Hono();

// GET /webhooks - List webhooks
webhookRoutes.get('/', authenticate(), authorize('ADMIN'), async (c) => {
  return c.json({ data: [] });
});

// POST /webhooks - Create webhook subscription
webhookRoutes.post('/', authenticate(), authorize('ADMIN'), async (c) => {
  const body = await c.req.json();
  return c.json({ data: { id: 'webhook-123' } }, 201);
});

// DELETE /webhooks/:id - Delete webhook
webhookRoutes.delete('/:id', authenticate(), authorize('ADMIN'), async (c) => {
  const id = c.req.param('id');
  return c.json({ message: 'Webhook deleted' });
});

// GET /webhook-deliveries - List webhook deliveries
webhookRoutes.get('/deliveries', authenticate(), authorize('ADMIN'), async (c) => {
  return c.json({ data: [] });
});

export { webhookRoutes };
