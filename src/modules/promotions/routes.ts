import { Hono } from 'hono';
import { IDatabase } from '@shared/interfaces/IDatabase.js';
import { CouponRepository, DiscountRepository } from './repositories/PromotionRepository.js';
import { PromotionService } from './services/PromotionService.js';

export function createPromotionRoutes(database: IDatabase) {
  const app = new Hono();

  const couponRepo = new CouponRepository(database);
  const discountRepo = new DiscountRepository(database);
  const promotionService = new PromotionService(couponRepo, discountRepo);

  app.post('/validate-coupon', async (c) => {
    const body = await c.req.json();
    const validation = await promotionService.validateCoupon(body);
    return c.json(validation);
  });

  app.post('/apply-discounts', async (c) => {
    const body = await c.req.json();
    const result = await promotionService.applyDiscounts(body);
    return c.json(result);
  });

  app.get('/coupons', async (c) => {
    const isActive = c.req.query('isActive');
    const filters: any = {};
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    const coupons = await couponRepo.findAll(filters);
    return c.json({ coupons });
  });

  app.get('/discounts', async (c) => {
    const discounts = await discountRepo.findActive();
    return c.json({ discounts });
  });

  return app;
}
