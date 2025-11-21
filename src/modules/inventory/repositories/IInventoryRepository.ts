import { IQueryableRepository } from '@shared/interfaces/IRepository.js';
import { StockLevel, Warehouse, StockMovement } from '../models/Inventory.js';

export interface IWarehouseRepository extends IQueryableRepository<Warehouse> {
  findByCode(code: string): Promise<Warehouse | null>;
}

export interface IStockLevelRepository extends IQueryableRepository<StockLevel> {
  findByVariantAndWarehouse(variantId: string, warehouseId: string): Promise<StockLevel | null>;
  findByVariant(variantId: string): Promise<StockLevel[]>;
}

export interface IStockMovementRepository extends IQueryableRepository<StockMovement> {
  findByVariant(variantId: string): Promise<StockMovement[]>;
}
