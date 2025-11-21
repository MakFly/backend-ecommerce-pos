import { IStockMovementRepository } from './IInventoryRepository.js';
import { StockMovement } from '../models/Inventory.js';
import { IDatabase } from '@shared/interfaces/IDatabase.js';

/**
 * Stock Movement Repository
 *
 * SOLID Principles:
 * - Single Responsibility: Stock movement data access only
 * - Dependency Inversion: Depends on IDatabase abstraction
 */
export class StockMovementRepository implements IStockMovementRepository {
  constructor(private readonly db: IDatabase) {}

  async findById(id: string): Promise<StockMovement | null> {
    const rows = await this.db.query<any>(
      `SELECT * FROM stock_movements WHERE id = $1`,
      [id]
    );

    if (rows.length === 0) return null;

    return this.mapToStockMovement(rows[0]);
  }

  async findByVariant(variantId: string, limit?: number): Promise<StockMovement[]> {
    const rows = await this.db.query<any>(
      `SELECT * FROM stock_movements
       WHERE variant_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [variantId, limit || 100]
    );

    return rows.map(this.mapToStockMovement);
  }

  async findByWarehouse(warehouseId: string, limit?: number): Promise<StockMovement[]> {
    const rows = await this.db.query<any>(
      `SELECT * FROM stock_movements
       WHERE warehouse_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [warehouseId, limit || 100]
    );

    return rows.map(this.mapToStockMovement);
  }

  async save(movement: StockMovement): Promise<void> {
    await this.db.execute(
      `INSERT INTO stock_movements (
        id, variant_id, warehouse_id, type, quantity, reason, reference, metadata, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        movement.id,
        movement.variantId,
        movement.warehouseId,
        movement.type,
        movement.quantity,
        movement.reason,
        movement.reference,
        JSON.stringify(movement.metadata),
        movement.createdAt,
      ]
    );
  }

  private mapToStockMovement(row: any): StockMovement {
    return {
      id: row.id,
      variantId: row.variant_id,
      warehouseId: row.warehouse_id,
      type: row.type,
      quantity: row.quantity,
      reason: row.reason,
      reference: row.reference,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
      createdAt: row.created_at,
    };
  }
}
