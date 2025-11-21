import { faker } from '@faker-js/faker';
import {
  ShippingZone,
  ShippingRate,
  ShippingQuote,
} from '@modules/shipping/models/Shipping.js';

/**
 * Data Factory for Shipping
 *
 * SOLID Principles:
 * - Single Responsibility: Generate fake shipping data only
 * - Open/Closed: Easy to extend with new methods
 *
 * Usage:
 * - Tests: Create fake shipping zones and rates for testing
 * - Seeding: Populate database with sample data
 */
export class ShippingFactory {
  /**
   * Generate a fake shipping zone
   */
  static createShippingZone(overrides?: Partial<ShippingZone>): ShippingZone {
    return {
      id: faker.string.nanoid(),
      name: `${faker.location.country()} Zone`,
      countries: faker.helpers.arrayElements(
        ['US', 'CA', 'GB', 'FR', 'DE', 'AU', 'JP', 'BR'],
        faker.number.int({ min: 1, max: 4 })
      ),
      regions: [],
      isActive: faker.datatype.boolean({ probability: 0.9 }),
      ...overrides,
    };
  }

  /**
   * Generate a fake shipping rate
   */
  static createShippingRate(overrides?: Partial<ShippingRate>): ShippingRate {
    return {
      id: faker.string.nanoid(),
      zoneId: faker.string.nanoid(),
      name: faker.helpers.arrayElement([
        'Standard Shipping',
        'Express Shipping',
        'Overnight Shipping',
        'Free Shipping',
        'Economy Shipping',
      ]),
      price: faker.number.float({ min: 0, max: 50, fractionDigits: 2 }),
      minOrderValue: faker.number.float({ min: 0, max: 100, fractionDigits: 2 }),
      maxOrderValue: faker.number.float({ min: 100, max: 1000, fractionDigits: 2 }),
      minWeight: faker.number.float({ min: 0, max: 1, fractionDigits: 2 }),
      maxWeight: faker.number.float({ min: 1, max: 50, fractionDigits: 2 }),
      deliveryTime: faker.helpers.arrayElement([
        '1-2 business days',
        '3-5 business days',
        '5-7 business days',
        '7-14 business days',
      ]),
      isActive: faker.datatype.boolean({ probability: 0.9 }),
      ...overrides,
    };
  }

  /**
   * Generate a fake shipping quote
   */
  static createShippingQuote(overrides?: Partial<ShippingQuote>): ShippingQuote {
    return {
      rateId: faker.string.nanoid(),
      name: faker.helpers.arrayElement([
        'Standard Shipping',
        'Express Shipping',
        'Overnight Shipping',
      ]),
      price: faker.number.float({ min: 5, max: 50, fractionDigits: 2 }),
      deliveryTime: faker.helpers.arrayElement([
        '1-2 business days',
        '3-5 business days',
        '5-7 business days',
      ]),
      ...overrides,
    };
  }

  /**
   * Generate multiple shipping zones
   */
  static createShippingZones(count: number, overrides?: Partial<ShippingZone>): ShippingZone[] {
    return Array.from({ length: count }, () => this.createShippingZone(overrides));
  }

  /**
   * Generate multiple shipping rates
   */
  static createShippingRates(count: number, zoneId?: string): ShippingRate[] {
    return Array.from({ length: count }, () =>
      this.createShippingRate(zoneId ? { zoneId } : {})
    );
  }

  /**
   * Generate multiple shipping quotes
   */
  static createShippingQuotes(count: number = 3): ShippingQuote[] {
    return [
      this.createShippingQuote({
        name: 'Standard Shipping',
        price: 5.99,
        deliveryTime: '5-7 business days',
      }),
      this.createShippingQuote({
        name: 'Express Shipping',
        price: 15.99,
        deliveryTime: '2-3 business days',
      }),
      this.createShippingQuote({
        name: 'Overnight Shipping',
        price: 29.99,
        deliveryTime: '1 business day',
      }),
    ].slice(0, count);
  }

  /**
   * Generate a complete shipping setup with zones and rates
   */
  static createShippingSetup(zoneCount: number = 3, ratesPerZone: number = 3): {
    zones: ShippingZone[];
    rates: ShippingRate[];
  } {
    const zones = this.createShippingZones(zoneCount, { isActive: true });
    const rates: ShippingRate[] = [];

    for (const zone of zones) {
      rates.push(...this.createShippingRates(ratesPerZone, zone.id));
    }

    return { zones, rates };
  }

  /**
   * Generate a free shipping rate
   */
  static createFreeShippingRate(overrides?: Partial<ShippingRate>): ShippingRate {
    return this.createShippingRate({
      name: 'Free Shipping',
      price: 0,
      minOrderValue: 50,
      deliveryTime: '5-7 business days',
      isActive: true,
      ...overrides,
    });
  }

  /**
   * Generate an express shipping rate
   */
  static createExpressShippingRate(overrides?: Partial<ShippingRate>): ShippingRate {
    return this.createShippingRate({
      name: 'Express Shipping',
      price: 19.99,
      deliveryTime: '1-2 business days',
      isActive: true,
      ...overrides,
    });
  }
}
