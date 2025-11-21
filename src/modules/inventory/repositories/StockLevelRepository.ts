import { IStockLevelRepository } from './IInventoryRepository.js';
import { StockLevel } from '../models/Inventory.js';
import { IDatabase } from '@shared/interfaces/IDatabase.js';

/**
 * Stock Level Repository
 *
 * SOLID Principles:
 * - Single Responsibility: Stock level data access only
 * - Dependency Inversion: Depends on IDatabase abstraction
 */
export class StockLevelRepository implements IStockLevelRepository {
  constructor(private readonly db: IDatabase) {}

  async findByVariantAndWarehouse(
    variantId: string,
    warehouseId: string
  ): Promise<StockLevel | null> {
    const rows = await this.db.query<any>(
      `SELECT * FROM stock_levels
       WHERE variant_id = $1 AND warehouse_id = $2`,
      [variantId, warehouseId]
    );

    if (rows.length === 0) return null;

    return this.mapToStockLevel(rows[0]);
  }

  async findByVariant(variantId: string): Promise<StockLevel[]> {
    const rows = await this.db.query<any>(
      `SELECT * FROM stock_levels WHERE variant_id = $1`,
      [variantId]
    );

    return rows.map(this.mapToStockLevel);
  }

  async findByWarehouse(warehouseId: string): Promise<StockLevel[]> {
    const rows = await this.db.query<any>(
      `SELECT * FROM stock_levels WHERE warehouse_id = $1`,
      [warehouseId]
    );

    return rows.map(this.mapToStockLevel);
  }

  async save(stockLevel: StockLevel): Promise<void> {
    await this.db.execute(
      `INSERT INTO stock_levels (
        id, variant_id, warehouse_id, available, reserved, incoming, on_hand
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (variant_id, warehouse_id) DO UPDATE SET
        available = $4, reserved = $5, incoming = $6, on_hand = $7`,
      [
        stockLevel.id,
        stockLevel.variantId,
        stockLevel.warehouseId,
        stockLevel.available,
        stockLevel.reserved,
        stockLevel.incoming,
        stockLevel.onHand,
      ]
    );
  }

  async updateAvailable(
    variantId: string,
    warehouseId: string,
    quantity: number
  ): Promise<void> {
    await this.db.execute(
      `UPDATE stock_levels
       SET available = available + $3, on_hand = on_hand + $3
       WHERE variant_id = $1 AND warehouse_id = $2`,
      [variantId, warehouseId, quantity]
    );
  }

  async updateReserved(
    variantId: string,
    warehouseId: string,
    quantity: number
  ): Promise<void> {
    await this.db.execute(
      `UPDATE stock_levels
       SET reserved = reserved + $3
       WHERE variant_id = $1 AND warehouse_id = $2`,
      [variantId, warehouseId, quantity]
    );
  }

  private mapToStockLevel(row: any): StockLevel {
    return {
      id: row.id,
      variantId: row.variant_id,
      warehouseId: row.warehouse_id,
      available: row.available,
      reserved: row.reserved,
      incoming: row.incoming,
      onHand: row.on_hand,
    };
  }
}
