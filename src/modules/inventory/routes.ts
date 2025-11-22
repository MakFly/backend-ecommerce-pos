import { Hono } from 'hono';
import { IDatabase } from '@shared/interfaces/IDatabase.js';
import { WarehouseRepository } from './repositories/WarehouseRepository.js';
import { StockLevelRepository } from './repositories/StockLevelRepository.js';
import { StockMovementRepository } from './repositories/StockMovementRepository.js';
import { InventoryService } from './services/InventoryService.js';
import { validate } from '@shared/middleware/validationMiddleware.js';
import { ReserveStockSchema, ReleaseStockSchema, AdjustStockSchema } from '@shared/validation/schemas.js';

/**
 * Inventory Routes
 *
 * REST API for inventory management
 */
export function createInventoryRoutes(database: IDatabase) {
  const app = new Hono();

  // Initialize repositories and service
  const warehouseRepo = new WarehouseRepository(database);
  const stockLevelRepo = new StockLevelRepository(database);
  const stockMovementRepo = new StockMovementRepository(database);
  const inventoryService = new InventoryService(warehouseRepo, stockLevelRepo, stockMovementRepo);

  /**
   * GET /warehouses
   * List all warehouses
   */
  app.get('/warehouses', async (c) => {
    const isActive = c.req.query('isActive');
    const filters = isActive !== undefined ? { isActive: isActive === 'true' } : undefined;

    const warehouses = await inventoryService.listWarehouses(filters);
    return c.json({ warehouses });
  });

  /**
   * GET /warehouses/:id
   * Get a single warehouse
   */
  app.get('/warehouses/:id', async (c) => {
    const { id } = c.req.param();
    const warehouse = await inventoryService.getWarehouse(id);

    if (!warehouse) {
      return c.json({ error: 'Warehouse not found' }, 404);
    }

    return c.json({ warehouse });
  });

  /**
   * GET /stock-levels
   * Get stock levels (optionally filter by variant)
   */
  app.get('/stock-levels', async (c) => {
    const variantId = c.req.query('variantId');
    const filters = variantId ? { variantId } : undefined;

    const stockLevels = await inventoryService.listStockLevels(filters);
    return c.json({ stockLevels });
  });

  /**
   * GET /stock-levels/:variantId/:warehouseId
   * Get stock level for a specific variant in a warehouse
   */
  app.get('/stock-levels/:variantId/:warehouseId', async (c) => {
    const { variantId, warehouseId } = c.req.param();
    const stockLevel = await inventoryService.getStockLevel(variantId, warehouseId);

    if (!stockLevel) {
      return c.json({ error: 'Stock level not found' }, 404);
    }

    return c.json({ stockLevel });
  });

  /**
   * POST /stock-levels/reserve
   * Reserve stock for an order
   */
  app.post('/stock-levels/reserve', validate(ReserveStockSchema), async (c) => {
    const body = c.get('validatedData');
    const stockLevel = await inventoryService.reserveStock(body);
    return c.json({ stockLevel }, 201);
  });

  /**
   * POST /stock-levels/release
   * Release reserved stock
   */
  app.post('/stock-levels/release', validate(ReleaseStockSchema), async (c) => {
    const body = c.get('validatedData');
    const stockLevel = await inventoryService.releaseStock(body);
    return c.json({ stockLevel });
  });

  /**
   * POST /stock-levels/adjust
   * Adjust stock level (inventory count, damaged goods, etc.)
   */
  app.post('/stock-levels/adjust', validate(AdjustStockSchema), async (c) => {
    const body = c.get('validatedData');
    const stockLevel = await inventoryService.adjustStock(body);
    return c.json({ stockLevel });
  });

  /**
   * GET /stock-movements
   * Get stock movements for a variant
   */
  app.get('/stock-movements', async (c) => {
    const variantId = c.req.query('variantId');
    const limit = c.req.query('limit');

    if (!variantId) {
      return c.json({ error: 'variantId is required' }, 400);
    }

    const movements = await inventoryService.getStockMovements(
      variantId,
      limit ? parseInt(limit) : undefined
    );

    return c.json({ movements });
  });

  return app;
}
