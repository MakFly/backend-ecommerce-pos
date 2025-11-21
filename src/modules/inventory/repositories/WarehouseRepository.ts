import { IWarehouseRepository } from './IInventoryRepository.js';
import { Warehouse } from '../models/Inventory.js';
import { IDatabase } from '@shared/interfaces/IDatabase.js';

/**
 * Warehouse Repository
 *
 * SOLID Principles:
 * - Single Responsibility: Warehouse data access only
 * - Dependency Inversion: Depends on IDatabase abstraction
 */
export class WarehouseRepository implements IWarehouseRepository {
  constructor(private readonly db: IDatabase) {}

  async findById(id: string): Promise<Warehouse | null> {
    const rows = await this.db.query<any>(
      `SELECT * FROM warehouses WHERE id = $1`,
      [id]
    );

    if (rows.length === 0) return null;

    return this.mapToWarehouse(rows[0]);
  }

  async findAll(filters?: { isActive?: boolean }): Promise<Warehouse[]> {
    let query = `SELECT * FROM warehouses`;
    const params: any[] = [];

    if (filters?.isActive !== undefined) {
      query += ` WHERE is_active = $1`;
      params.push(filters.isActive);
    }

    query += ` ORDER BY created_at DESC`;

    const rows = await this.db.query<any>(query, params);
    return rows.map(this.mapToWarehouse);
  }

  async save(warehouse: Warehouse): Promise<void> {
    await this.db.execute(
      `INSERT INTO warehouses (
        id, code, name, address, is_active, metadata, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        code = $2, name = $3, address = $4, is_active = $5,
        metadata = $6, updated_at = $8`,
      [
        warehouse.id,
        warehouse.code,
        warehouse.name,
        JSON.stringify(warehouse.address),
        warehouse.isActive,
        JSON.stringify(warehouse.metadata),
        warehouse.createdAt,
        warehouse.updatedAt,
      ]
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.execute(`DELETE FROM warehouses WHERE id = $1`, [id]);
  }

  private mapToWarehouse(row: any): Warehouse {
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      address: typeof row.address === 'string' ? JSON.parse(row.address) : row.address,
      isActive: row.is_active,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
