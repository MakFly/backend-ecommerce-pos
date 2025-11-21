import { Hono } from 'hono';
import { OrderRepository } from './repositories/OrderRepository.js';
import { OrderService } from './services/OrderService.js';
import { OrderController } from './controllers/OrderController.js';
import { authenticate, authorize } from '@shared/middleware/auth.js';
import { IDatabase } from '@shared/interfaces/IDatabase.js';

export function createOrderRoutes(database: IDatabase): Hono {
  const routes = new Hono();

  const repository = new OrderRepository(database);
  const service = new OrderService(repository);
  const controller = new OrderController(service);

  routes.get('/', authenticate(), (c) => controller.list(c));
  routes.get('/:id', authenticate(), (c) => controller.get(c));
  routes.post('/', authenticate(), (c) => controller.create(c));
  routes.patch('/:id', authenticate(), authorize('ADMIN', 'STAFF'), (c) => controller.update(c));
  routes.post('/:id/cancel', authenticate(), (c) => controller.cancel(c));
  routes.post('/:id/mark-paid', authenticate(), authorize('ADMIN', 'STAFF'), (c) =>
    controller.markPaid(c)
  );
  routes.post('/:id/mark-fulfilled', authenticate(), authorize('ADMIN', 'STAFF'), (c) =>
    controller.markFulfilled(c)
  );

  return routes;
}
