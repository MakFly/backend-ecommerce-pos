import { Hono } from 'hono';
import { authenticate, authorize } from '@shared/middleware/auth.js';

const posRoutes = new Hono();

// Open POS session
posRoutes.post('/sessions', authenticate(), authorize('POS_OPERATOR', 'STAFF'), async (c) => {
  const body = await c.req.json();
  return c.json({
    data: {
      sessionId: 'session-123',
      sessionNumber: 'POS-123',
      status: 'open',
    },
  }, 201);
});

// Close POS session
posRoutes.post('/sessions/:id/close', authenticate(), authorize('POS_OPERATOR', 'STAFF'), async (c) => {
  const id = c.req.param('id');
  return c.json({ message: 'Session closed' });
});

// Create POS sale
posRoutes.post('/sales', authenticate(), authorize('POS_OPERATOR', 'STAFF'), async (c) => {
  const body = await c.req.json();
  return c.json({
    data: {
      saleId: 'sale-123',
      total: 100.00,
    },
  }, 201);
});

// Product lookup (barcode scan)
posRoutes.get('/products/lookup', authenticate(), authorize('POS_OPERATOR', 'STAFF'), async (c) => {
  const barcode = c.req.query('barcode');
  const sku = c.req.query('sku');

  return c.json({
    data: {
      id: 'variant-123',
      sku: sku || 'SKU-001',
      barcode: barcode || '123456789',
      title: 'Product Title',
      price: 29.99,
      inStock: true,
    },
  });
});

export { posRoutes };
