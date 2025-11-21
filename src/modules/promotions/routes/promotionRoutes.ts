import { Hono } from 'hono';
import { authenticate, authorize } from '@shared/middleware/auth.js';

const promotionRoutes = new Hono();

// GET /promotions - List all promotions
promotionRoutes.get('/', authenticate(), async (c) => {
  return c.json({
    data: [],
  });
});

// POST /promotions - Create promotion
promotionRoutes.post('/', authenticate(), authorize('ADMIN', 'STAFF'), async (c) => {
  const body = await c.req.json();
  return c.json({ data: { id: 'promo-123' } }, 201);
});

// POST /promotions/validate-coupon - Validate coupon code
promotionRoutes.post('/validate-coupon', authenticate(), async (c) => {
  const { code } = await c.req.json();
  return c.json({
    data: {
      valid: true,
      code,
      discountType: 'percentage',
      discountValue: 10,
    },
  });
});

export { promotionRoutes };
