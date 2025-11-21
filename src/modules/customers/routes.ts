import { Hono } from 'hono';
import { CustomerRepository } from './repositories/CustomerRepository.js';
import { CustomerService } from './services/CustomerService.js';
import { authenticate, authorize } from '@shared/middleware/auth.js';
import { IDatabase } from '@shared/interfaces/IDatabase.js';

export function createCustomerRoutes(database: IDatabase): Hono {
  const routes = new Hono();

  const repository = new CustomerRepository(database);
  const service = new CustomerService(repository);

  routes.get('/', authenticate(), authorize('ADMIN', 'STAFF'), async (c) => {
    const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!) : undefined;
    const offset = c.req.query('offset') ? parseInt(c.req.query('offset')!) : undefined;
    const customers = await service.listCustomers({ limit, offset });
    return c.json({ data: customers });
  });

  routes.get('/:id', authenticate(), async (c) => {
    const id = c.req.param('id');
    const customer = await service.getCustomer(id);
    return c.json({ data: customer });
  });

  routes.post('/', async (c) => {
    const dto = await c.req.json();
    const customer = await service.createCustomer(dto);
    return c.json({ data: customer }, 201);
  });

  routes.patch('/:id', authenticate(), async (c) => {
    const id = c.req.param('id');
    const dto = await c.req.json();
    const customer = await service.updateCustomer(id, dto);
    return c.json({ data: customer });
  });

  routes.delete('/:id', authenticate(), authorize('ADMIN'), async (c) => {
    const id = c.req.param('id');
    await service.deleteCustomer(id);
    return c.json({ message: 'Customer deleted' });
  });

  return routes;
}
