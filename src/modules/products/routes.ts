import { Hono } from 'hono';
import { ProductController } from './controllers/ProductController.js';
import { ProductService } from './services/ProductService.js';
import { ProductRepository } from './repositories/ProductRepository.js';
import { authenticate, authorize } from '@shared/middleware/auth.js';
import { validateBody } from '@shared/validation/zodValidator.js';
import { CreateProductSchema, UpdateProductSchema } from './validators/ProductValidator.js';
import { IDatabase } from '@shared/interfaces/IDatabase.js';

/**
 * Product Routes Factory
 *
 * SOLID Principles:
 * - Dependency Inversion: Injects database dependency
 * - Single Responsibility: Route configuration only
 */
export function createProductRoutes(database: IDatabase): Hono {
  const routes = new Hono();

  // Dependency Injection Chain
  const repository = new ProductRepository(database);
  const service = new ProductService(repository);
  const controller = new ProductController(service);

  // Routes
  routes.get('/', authenticate(), (c) => controller.list(c));
  routes.get('/:id', authenticate(), (c) => controller.get(c));

  routes.post(
    '/',
    authenticate(),
    authorize('ADMIN', 'STAFF'),
    validateBody(CreateProductSchema),
    (c) => controller.create(c)
  );

  routes.patch(
    '/:id',
    authenticate(),
    authorize('ADMIN', 'STAFF'),
    validateBody(UpdateProductSchema),
    (c) => controller.update(c)
  );

  routes.delete('/:id', authenticate(), authorize('ADMIN'), (c) => controller.delete(c));

  return routes;
}
