import { Hono } from 'hono';
import { IDatabase } from '@shared/interfaces/IDatabase.js';
import { ShippingZoneRepository, ShippingRateRepository } from './repositories/ShippingRepository.js';
import { ShippingService } from './services/ShippingService.js';
import { validate } from '@shared/middleware/validationMiddleware.js';
import { CalculateShippingSchema } from '@shared/validation/schemas.js';

export function createShippingRoutes(database: IDatabase) {
  const app = new Hono();

  const zoneRepo = new ShippingZoneRepository(database);
  const rateRepo = new ShippingRateRepository(database);
  const shippingService = new ShippingService(zoneRepo, rateRepo);

  app.post('/calculate', validate(CalculateShippingSchema), async (c) => {
    const body = c.get('validatedData');
    const quotes = await shippingService.calculateShipping(body);
    return c.json({ quotes });
  });

  app.get('/zones', async (c) => {
    const zones = await zoneRepo.findAll({ isActive: true });
    return c.json({ zones });
  });

  app.get('/rates/:zoneId', async (c) => {
    const { zoneId } = c.req.param();
    const rates = await rateRepo.findByZone(zoneId);
    return c.json({ rates });
  });

  return app;
}
