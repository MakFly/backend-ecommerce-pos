import { faker } from '@faker-js/faker';
import {
  POSSession,
  POSSale,
  POSSaleItem,
  POSPayment,
} from '@modules/pos/models/POS.js';

/**
 * Data Factory for POS
 *
 * SOLID Principles:
 * - Single Responsibility: Generate fake POS data only
 * - Open/Closed: Easy to extend with new methods
 *
 * Usage:
 * - Tests: Create fake POS sessions and sales for testing
 * - Seeding: Populate database with sample data
 */
export class POSFactory {
  /**
   * Generate a fake POS session
   */
  static createPOSSession(overrides?: Partial<POSSession>): POSSession {
    const status = faker.helpers.arrayElement(['open', 'closed'] as const);
    const openingCash = faker.number.float({ min: 100, max: 500, fractionDigits: 2 });
    const closingCash = status === 'closed'
      ? faker.number.float({ min: 200, max: 2000, fractionDigits: 2 })
      : undefined;

    return {
      id: faker.string.nanoid(),
      sessionNumber: `POS-${faker.string.numeric(8)}`,
      locationId: faker.string.nanoid(),
      cashierId: faker.string.nanoid(),
      status,
      openingCash,
      closingCash,
      expectedCash: closingCash,
      totalSales: status === 'closed' ? faker.number.float({ min: 500, max: 5000, fractionDigits: 2 }) : 0,
      totalTransactions: status === 'closed' ? faker.number.int({ min: 10, max: 100 }) : 0,
      openedAt: faker.date.recent({ days: 1 }),
      closedAt: status === 'closed' ? faker.date.recent({ days: 1 }) : undefined,
      metadata: {},
      ...overrides,
    };
  }

  /**
   * Generate a fake POS sale
   */
  static createPOSSale(overrides?: Partial<POSSale>): POSSale {
    const items = this.createPOSSaleItems(faker.number.int({ min: 1, max: 5 }));
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    return {
      id: faker.string.nanoid(),
      saleNumber: `SALE-${faker.string.numeric(8)}`,
      sessionId: faker.string.nanoid(),
      customerId: faker.datatype.boolean({ probability: 0.7 }) ? faker.string.nanoid() : undefined,
      items,
      subtotal,
      tax,
      discount: 0,
      total,
      payments: [this.createPOSPayment({ amount: total })],
      status: faker.helpers.arrayElement(['completed', 'pending', 'cancelled']),
      metadata: {},
      createdAt: faker.date.recent({ days: 1 }),
      ...overrides,
    };
  }

  /**
   * Generate a fake POS sale item
   */
  static createPOSSaleItem(overrides?: Partial<POSSaleItem>): POSSaleItem {
    const quantity = faker.number.int({ min: 1, max: 10 });
    const price = faker.number.float({ min: 5, max: 100, fractionDigits: 2 });
    const total = quantity * price;

    return {
      id: faker.string.nanoid(),
      saleId: faker.string.nanoid(),
      productId: faker.string.nanoid(),
      variantId: faker.string.nanoid(),
      quantity,
      price,
      discount: 0,
      total,
      sku: faker.string.alphanumeric(10).toUpperCase(),
      title: faker.commerce.productName(),
      ...overrides,
    };
  }

  /**
   * Generate a fake POS payment
   */
  static createPOSPayment(overrides?: Partial<POSPayment>): POSPayment {
    return {
      id: faker.string.nanoid(),
      method: faker.helpers.arrayElement(['cash', 'card', 'mobile', 'other']),
      amount: faker.number.float({ min: 10, max: 500, fractionDigits: 2 }),
      reference: faker.string.alphanumeric(12).toUpperCase(),
      metadata: {},
      ...overrides,
    };
  }

  /**
   * Generate multiple POS sessions
   */
  static createPOSSessions(count: number, overrides?: Partial<POSSession>): POSSession[] {
    return Array.from({ length: count }, () => this.createPOSSession(overrides));
  }

  /**
   * Generate multiple POS sales
   */
  static createPOSSales(count: number, sessionId?: string): POSSale[] {
    return Array.from({ length: count }, () =>
      this.createPOSSale(sessionId ? { sessionId } : {})
    );
  }

  /**
   * Generate multiple POS sale items
   */
  static createPOSSaleItems(count: number, saleId?: string): POSSaleItem[] {
    return Array.from({ length: count }, () =>
      this.createPOSSaleItem(saleId ? { saleId } : {})
    );
  }

  /**
   * Generate a complete POS session with sales
   */
  static createPOSSessionWithSales(saleCount: number = 10): {
    session: POSSession;
    sales: POSSale[];
  } {
    const session = this.createPOSSession({ status: 'closed' });
    const sales = this.createPOSSales(saleCount, session.id);

    // Recalculate session totals
    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalTransactions = sales.length;

    session.totalSales = totalSales;
    session.totalTransactions = totalTransactions;
    session.expectedCash = (session.openingCash || 0) + totalSales;
    session.closingCash = session.expectedCash;

    return { session, sales };
  }

  /**
   * Generate an open POS session
   */
  static createOpenPOSSession(overrides?: Partial<POSSession>): POSSession {
    return this.createPOSSession({
      status: 'open',
      closingCash: undefined,
      expectedCash: undefined,
      totalSales: 0,
      totalTransactions: 0,
      closedAt: undefined,
      ...overrides,
    });
  }

  /**
   * Generate a closed POS session
   */
  static createClosedPOSSession(overrides?: Partial<POSSession>): POSSession {
    const openingCash = faker.number.float({ min: 100, max: 500, fractionDigits: 2 });
    const totalSales = faker.number.float({ min: 500, max: 5000, fractionDigits: 2 });
    const expectedCash = openingCash + totalSales;

    return this.createPOSSession({
      status: 'closed',
      openingCash,
      totalSales,
      totalTransactions: faker.number.int({ min: 10, max: 100 }),
      expectedCash,
      closingCash: expectedCash,
      closedAt: faker.date.recent({ days: 1 }),
      ...overrides,
    });
  }
}
