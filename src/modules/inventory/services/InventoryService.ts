import { nanoid } from 'nanoid';
import {
  IStockLevelRepository,
  IStockMovementRepository,
  IWarehouseRepository,
} from '../repositories/IInventoryRepository.js';
import {
  StockLevel,
  AdjustStockDto,
  ReserveStockDto,
  StockMovement,
  Warehouse,
} from '../models/Inventory.js';

export class InventoryService {
  constructor(
    private readonly warehouseRepo: IWarehouseRepository,
    private readonly stockLevelRepo: IStockLevelRepository,
    private readonly stockMovementRepo: IStockMovementRepository
  ) {}

  async getStockLevel(variantId: string, warehouseId: string): Promise<StockLevel> {
    const stock = await this.stockLevelRepo.findByVariantAndWarehouse(variantId, warehouseId);
    if (!stock) {
      // Return default stock level
      return {
        id: nanoid(),
        variantId,
        warehouseId,
        available: 0,
        reserved: 0,
        incoming: 0,
        updatedAt: new Date(),
      };
    }
    return stock;
  }

  async adjustStock(dto: AdjustStockDto): Promise<StockLevel> {
    let stock = await this.stockLevelRepo.findByVariantAndWarehouse(
      dto.variantId,
      dto.warehouseId
    );

    if (!stock) {
      stock = {
        id: nanoid(),
        variantId: dto.variantId,
        warehouseId: dto.warehouseId,
        available: 0,
        reserved: 0,
        incoming: 0,
        updatedAt: new Date(),
      };
    }

    stock.available += dto.quantity;
    stock.updatedAt = new Date();

    await this.stockLevelRepo.save(stock);

    // Record movement
    const movement: StockMovement = {
      id: nanoid(),
      variantId: dto.variantId,
      warehouseId: dto.warehouseId,
      type: 'adjustment',
      quantity: dto.quantity,
      note: dto.note,
      createdAt: new Date(),
    };
    await this.stockMovementRepo.save(movement);

    return stock;
  }

  async reserveStock(dto: ReserveStockDto): Promise<StockLevel> {
    const stock = await this.getStockLevel(dto.variantId, dto.warehouseId);

    if (stock.available < dto.quantity) {
      throw new Error('Insufficient stock available');
    }

    stock.available -= dto.quantity;
    stock.reserved += dto.quantity;
    stock.updatedAt = new Date();

    await this.stockLevelRepo.save(stock);

    // Record movement
    const movement: StockMovement = {
      id: nanoid(),
      variantId: dto.variantId,
      warehouseId: dto.warehouseId,
      type: 'reserved',
      quantity: dto.quantity,
      referenceType: dto.referenceType,
      referenceId: dto.referenceId,
      createdAt: new Date(),
    };
    await this.stockMovementRepo.save(movement);

    return stock;
  }

  async releaseStock(dto: ReserveStockDto): Promise<StockLevel> {
    const stock = await this.getStockLevel(dto.variantId, dto.warehouseId);

    if (stock.reserved < dto.quantity) {
      throw new Error('Invalid release quantity');
    }

    stock.reserved -= dto.quantity;
    stock.available += dto.quantity;
    stock.updatedAt = new Date();

    await this.stockLevelRepo.save(stock);

    // Record movement
    const movement: StockMovement = {
      id: nanoid(),
      variantId: dto.variantId,
      warehouseId: dto.warehouseId,
      type: 'released',
      quantity: dto.quantity,
      referenceType: dto.referenceType,
      referenceId: dto.referenceId,
      createdAt: new Date(),
    };
    await this.stockMovementRepo.save(movement);

    return stock;
  }

  async getStockLevelsByVariant(variantId: string): Promise<StockLevel[]> {
    return this.stockLevelRepo.findByVariant(variantId);
  }

  async getStockMovements(variantId: string, limit?: number): Promise<StockMovement[]> {
    return this.stockMovementRepo.findByVariant(variantId, limit);
  }

  // Warehouse methods
  async listWarehouses(filters?: { isActive?: boolean }): Promise<Warehouse[]> {
    return this.warehouseRepo.findAll(filters);
  }

  async getWarehouse(id: string): Promise<Warehouse | null> {
    return this.warehouseRepo.findById(id);
  }

  // Stock level methods
  async listStockLevels(filters?: { variantId?: string }): Promise<StockLevel[]> {
    if (filters?.variantId) {
      return this.stockLevelRepo.findByVariant(filters.variantId);
    }
    // For now, return empty array if no filter (could implement findAll in repo)
    return [];
  }
}
