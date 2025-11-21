import { faker } from '@faker-js/faker';
import {
  Warehouse,
  StockLevel,
  StockMovement,
  MovementType,
} from '@modules/inventory/models/Inventory.js';

/**
 * Data Factory for Inventory
 *
 * SOLID Principles:
 * - Single Responsibility: Generate fake inventory data only
 * - Open/Closed: Easy to extend with new methods
 *
 * Usage:
 * - Tests: Create fake inventory for testing
 * - Seeding: Populate database with sample data
 */
export class InventoryFactory {
  /**
   * Generate a fake warehouse
   */
  static createWarehouse(overrides?: Partial<Warehouse>): Warehouse {
    return {
      id: faker.string.nanoid(),
      code: faker.string.alphanumeric(6).toUpperCase(),
      name: `${faker.location.city()} Warehouse`,
      address: {
        address1: faker.location.streetAddress(),
        address2: faker.location.secondaryAddress(),
        city: faker.location.city(),
        region: faker.location.state(),
        postalCode: faker.location.zipCode(),
        country: faker.location.countryCode(),
      },
      isActive: faker.datatype.boolean({ probability: 0.9 }),
      metadata: {},
      createdAt: faker.date.past(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  /**
   * Generate a fake stock level
   */
  static createStockLevel(overrides?: Partial<StockLevel>): StockLevel {
    const available = faker.number.int({ min: 0, max: 1000 });
    const reserved = faker.number.int({ min: 0, max: 100 });
    const incoming = faker.number.int({ min: 0, max: 200 });

    return {
      id: faker.string.nanoid(),
      variantId: faker.string.nanoid(),
      warehouseId: faker.string.nanoid(),
      available,
      reserved,
      incoming,
      onHand: available + reserved,
      ...overrides,
    };
  }

  /**
   * Generate a fake stock movement
   */
  static createStockMovement(overrides?: Partial<StockMovement>): StockMovement {
    const type = faker.helpers.arrayElement([
      'purchase',
      'sale',
      'adjustment',
      'transfer',
      'return',
      'damaged',
    ] as MovementType[]);

    const quantity = type === 'sale' || type === 'damaged'
      ? -faker.number.int({ min: 1, max: 50 })
      : faker.number.int({ min: 1, max: 100 });

    return {
      id: faker.string.nanoid(),
      variantId: faker.string.nanoid(),
      warehouseId: faker.string.nanoid(),
      type,
      quantity,
      reason: faker.lorem.sentence(),
      reference: `REF-${faker.string.alphanumeric(8).toUpperCase()}`,
      metadata: {},
      createdAt: faker.date.recent({ days: 30 }),
      ...overrides,
    };
  }

  /**
   * Generate multiple warehouses
   */
  static createWarehouses(count: number, overrides?: Partial<Warehouse>): Warehouse[] {
    return Array.from({ length: count }, () => this.createWarehouse(overrides));
  }

  /**
   * Generate multiple stock levels
   */
  static createStockLevels(
    count: number,
    variantId?: string,
    warehouseId?: string
  ): StockLevel[] {
    return Array.from({ length: count }, () =>
      this.createStockLevel({
        ...(variantId && { variantId }),
        ...(warehouseId && { warehouseId }),
      })
    );
  }

  /**
   * Generate multiple stock movements
   */
  static createStockMovements(
    count: number,
    variantId?: string,
    warehouseId?: string
  ): StockMovement[] {
    return Array.from({ length: count }, () =>
      this.createStockMovement({
        ...(variantId && { variantId }),
        ...(warehouseId && { warehouseId }),
      })
    );
  }

  /**
   * Generate stock levels for a product variant across warehouses
   */
  static createStockLevelsForVariant(variantId: string, warehouseIds: string[]): StockLevel[] {
    return warehouseIds.map((warehouseId) =>
      this.createStockLevel({ variantId, warehouseId })
    );
  }

  /**
   * Generate a complete inventory setup
   */
  static createInventorySetup(warehouseCount: number = 3, variantCount: number = 10): {
    warehouses: Warehouse[];
    stockLevels: StockLevel[];
  } {
    const warehouses = this.createWarehouses(warehouseCount, { isActive: true });
    const variantIds = Array.from({ length: variantCount }, () => faker.string.nanoid());

    const stockLevels: StockLevel[] = [];
    for (const variantId of variantIds) {
      for (const warehouse of warehouses) {
        stockLevels.push(this.createStockLevel({ variantId, warehouseId: warehouse.id }));
      }
    }

    return { warehouses, stockLevels };
  }

  /**
   * Generate a low stock level
   */
  static createLowStockLevel(overrides?: Partial<StockLevel>): StockLevel {
    return this.createStockLevel({
      available: faker.number.int({ min: 0, max: 10 }),
      reserved: faker.number.int({ min: 0, max: 5 }),
      incoming: 0,
      ...overrides,
    });
  }

  /**
   * Generate an out of stock level
   */
  static createOutOfStockLevel(overrides?: Partial<StockLevel>): StockLevel {
    return this.createStockLevel({
      available: 0,
      reserved: 0,
      incoming: faker.number.int({ min: 0, max: 50 }),
      ...overrides,
    });
  }
}
