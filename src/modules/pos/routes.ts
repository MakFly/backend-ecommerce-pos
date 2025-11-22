import { Hono } from 'hono';
import { IDatabase } from '@shared/interfaces/IDatabase.js';
import { POSSessionRepository } from './repositories/POSSessionRepository.js';
import { POSSaleRepository } from './repositories/POSSaleRepository.js';
import { POSService } from './services/POSService.js';
import { validate } from '@shared/middleware/validationMiddleware.js';
import { OpenSessionSchema, CloseSessionSchema, CreatePOSSaleSchema } from '@shared/validation/schemas.js';

/**
 * POS Routes
 *
 * REST API for Point of Sale operations
 */
export function createPOSRoutes(database: IDatabase) {
  const app = new Hono();

  // Initialize repositories and service
  const sessionRepo = new POSSessionRepository(database);
  const saleRepo = new POSSaleRepository(database);
  const posService = new POSService(sessionRepo, saleRepo);

  /**
   * GET /sessions
   * List all POS sessions
   */
  app.get('/sessions', async (c) => {
    const status = c.req.query('status');
    const limit = c.req.query('limit');

    const filters: any = {};
    if (status) filters.status = status;
    if (limit) filters.limit = parseInt(limit);

    const sessions = await posService.listSessions(filters);
    return c.json({ sessions });
  });

  /**
   * GET /sessions/:id
   * Get a single POS session
   */
  app.get('/sessions/:id', async (c) => {
    const { id } = c.req.param();
    const session = await posService.getSession(id);

    if (!session) {
      return c.json({ error: 'Session not found' }, 404);
    }

    return c.json({ session });
  });

  /**
   * POST /sessions
   * Open a new POS session
   */
  app.post('/sessions', validate(OpenSessionSchema), async (c) => {
    const body = c.get('validatedData');
    const session = await posService.openSession(body);
    return c.json({ session }, 201);
  });

  /**
   * PUT /sessions/:id/close
   * Close a POS session
   */
  app.put('/sessions/:id/close', validate(CloseSessionSchema), async (c) => {
    const { id } = c.req.param();
    const body = c.get('validatedData');
    const session = await posService.closeSession(id, body);
    return c.json({ session });
  });

  /**
   * GET /sales
   * Get sales for a session
   */
  app.get('/sales', async (c) => {
    const sessionId = c.req.query('sessionId');
    const limit = c.req.query('limit');

    if (!sessionId) {
      return c.json({ error: 'sessionId is required' }, 400);
    }

    const filters: any = { sessionId };
    if (limit) filters.limit = parseInt(limit);

    const sales = await posService.listSales(filters);
    return c.json({ sales });
  });

  /**
   * GET /sales/:id
   * Get a single sale
   */
  app.get('/sales/:id', async (c) => {
    const { id } = c.req.param();
    const sale = await posService.getSale(id);

    if (!sale) {
      return c.json({ error: 'Sale not found' }, 404);
    }

    return c.json({ sale });
  });

  /**
   * POST /sales
   * Create a new POS sale
   */
  app.post('/sales', validate(CreatePOSSaleSchema), async (c) => {
    const body = c.get('validatedData');
    const sale = await posService.createSale(body);
    return c.json({ sale }, 201);
  });

  return app;
}
