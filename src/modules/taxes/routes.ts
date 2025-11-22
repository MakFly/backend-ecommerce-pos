import { Hono } from 'hono';
import { IDatabase } from '@shared/interfaces/IDatabase.js';
import { TaxRateRepository } from './repositories/TaxRateRepository.js';
import { TaxService } from './services/TaxService.js';
import { validate } from '@shared/middleware/validationMiddleware.js';
import { CalculateTaxSchema } from '@shared/validation/schemas.js';

export function createTaxRoutes(database: IDatabase) {
  const app = new Hono();

  const taxRateRepo = new TaxRateRepository(database);
  const taxService = new TaxService(taxRateRepo);

  app.post('/calculate', validate(CalculateTaxSchema), async (c) => {
    const body = c.get('validatedData');
    const calculation = await taxService.calculateTax(body);
    return c.json(calculation);
  });

  app.get('/rates', async (c) => {
    const country = c.req.query('country');
    const region = c.req.query('region');

    if (!country) {
      return c.json({ error: 'country is required' }, 400);
    }

    const rates = region
      ? await taxRateRepo.findByRegion(country, region)
      : await taxRateRepo.findByCountry(country);

    return c.json({ rates });
  });

  return app;
}
