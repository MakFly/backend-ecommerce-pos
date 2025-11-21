import { faker } from '@faker-js/faker';
import {
  Coupon,
  Discount,
  DiscountType,
  DiscountTarget,
} from '@modules/promotions/models/Promotion.js';

/**
 * Data Factory for Promotions
 *
 * SOLID Principles:
 * - Single Responsibility: Generate fake promotion data only
 * - Open/Closed: Easy to extend with new methods
 *
 * Usage:
 * - Tests: Create fake coupons and discounts for testing
 * - Seeding: Populate database with sample data
 */
export class PromotionFactory {
  /**
   * Generate a fake coupon
   */
  static createCoupon(overrides?: Partial<Coupon>): Coupon {
    const type = faker.helpers.arrayElement(['percentage', 'fixed', 'free_shipping'] as DiscountType[]);
    const value = type === 'percentage'
      ? faker.number.int({ min: 5, max: 50 })
      : faker.number.float({ min: 5, max: 100, fractionDigits: 2 });

    return {
      id: faker.string.nanoid(),
      code: faker.string.alphanumeric(8).toUpperCase(),
      type,
      value,
      minPurchaseAmount: faker.datatype.boolean({ probability: 0.5 })
        ? faker.number.float({ min: 25, max: 100, fractionDigits: 2 })
        : undefined,
      maxDiscountAmount: type === 'percentage' && faker.datatype.boolean({ probability: 0.5 })
        ? faker.number.float({ min: 20, max: 100, fractionDigits: 2 })
        : undefined,
      usageLimit: faker.datatype.boolean({ probability: 0.6 })
        ? faker.number.int({ min: 10, max: 1000 })
        : undefined,
      timesUsed: faker.number.int({ min: 0, max: 50 }),
      startsAt: faker.date.recent({ days: 30 }),
      endsAt: faker.date.future({ years: 0.25 }),
      isActive: faker.datatype.boolean({ probability: 0.8 }),
      metadata: {},
      createdAt: faker.date.past(),
      ...overrides,
    };
  }

  /**
   * Generate a fake discount
   */
  static createDiscount(overrides?: Partial<Discount>): Discount {
    const type = faker.helpers.arrayElement(['percentage', 'fixed', 'buy_x_get_y', 'free_shipping'] as DiscountType[]);
    const target = faker.helpers.arrayElement(['order', 'product', 'shipping'] as DiscountTarget[]);
    const value = type === 'percentage'
      ? faker.number.int({ min: 5, max: 50 })
      : faker.number.float({ min: 5, max: 100, fractionDigits: 2 });

    return {
      id: faker.string.nanoid(),
      title: faker.commerce.productAdjective() + ' ' + faker.helpers.arrayElement(['Sale', 'Discount', 'Deal', 'Offer']),
      type,
      value,
      target,
      targetSelection: faker.helpers.arrayElement(['all', 'specific'] as const),
      productIds: faker.datatype.boolean({ probability: 0.3 })
        ? faker.helpers.multiple(() => faker.string.nanoid(), { count: faker.number.int({ min: 1, max: 5 }) })
        : undefined,
      collectionIds: faker.datatype.boolean({ probability: 0.3 })
        ? faker.helpers.multiple(() => faker.string.nanoid(), { count: faker.number.int({ min: 1, max: 3 }) })
        : undefined,
      minPurchaseAmount: faker.datatype.boolean({ probability: 0.5 })
        ? faker.number.float({ min: 50, max: 200, fractionDigits: 2 })
        : undefined,
      startsAt: faker.date.recent({ days: 30 }),
      endsAt: faker.date.future({ years: 0.25 }),
      isActive: faker.datatype.boolean({ probability: 0.8 }),
      priority: faker.number.int({ min: 1, max: 10 }),
      ...overrides,
    };
  }

  /**
   * Generate multiple coupons
   */
  static createCoupons(count: number, overrides?: Partial<Coupon>): Coupon[] {
    return Array.from({ length: count }, () => this.createCoupon(overrides));
  }

  /**
   * Generate multiple discounts
   */
  static createDiscounts(count: number, overrides?: Partial<Discount>): Discount[] {
    return Array.from({ length: count }, () => this.createDiscount(overrides));
  }

  /**
   * Generate a percentage coupon
   */
  static createPercentageCoupon(percentage: number, overrides?: Partial<Coupon>): Coupon {
    return this.createCoupon({
      type: 'percentage',
      value: percentage,
      code: `SAVE${percentage}`,
      isActive: true,
      ...overrides,
    });
  }

  /**
   * Generate a fixed amount coupon
   */
  static createFixedCoupon(amount: number, overrides?: Partial<Coupon>): Coupon {
    return this.createCoupon({
      type: 'fixed',
      value: amount,
      code: `SAVE${Math.round(amount)}`,
      isActive: true,
      ...overrides,
    });
  }

  /**
   * Generate a free shipping coupon
   */
  static createFreeShippingCoupon(overrides?: Partial<Coupon>): Coupon {
    return this.createCoupon({
      type: 'free_shipping',
      value: 0,
      code: 'FREESHIP',
      minPurchaseAmount: 50,
      isActive: true,
      ...overrides,
    });
  }

  /**
   * Generate a first-time customer coupon
   */
  static createFirstTimeCoupon(overrides?: Partial<Coupon>): Coupon {
    return this.createCoupon({
      type: 'percentage',
      value: 15,
      code: 'WELCOME15',
      usageLimit: 1,
      isActive: true,
      ...overrides,
    });
  }

  /**
   * Generate a seasonal sale discount
   */
  static createSeasonalDiscount(season: string, overrides?: Partial<Discount>): Discount {
    return this.createDiscount({
      title: `${season} Sale`,
      type: 'percentage',
      value: faker.number.int({ min: 20, max: 50 }),
      target: 'order',
      targetSelection: 'all',
      isActive: true,
      priority: 1,
      ...overrides,
    });
  }

  /**
   * Generate a buy X get Y discount
   */
  static createBuyXGetYDiscount(overrides?: Partial<Discount>): Discount {
    return this.createDiscount({
      title: 'Buy 2 Get 1 Free',
      type: 'buy_x_get_y',
      value: 100,
      target: 'product',
      targetSelection: 'specific',
      isActive: true,
      ...overrides,
    });
  }

  /**
   * Generate a flash sale discount
   */
  static createFlashSaleDiscount(overrides?: Partial<Discount>): Discount {
    const now = new Date();
    const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    return this.createDiscount({
      title: 'Flash Sale - 24 Hours Only!',
      type: 'percentage',
      value: faker.number.int({ min: 30, max: 70 }),
      target: 'order',
      targetSelection: 'all',
      startsAt: now,
      endsAt: endTime,
      isActive: true,
      priority: 10,
      ...overrides,
    });
  }

  /**
   * Generate a complete promotion campaign
   */
  static createPromotionCampaign(name: string): {
    coupons: Coupon[];
    discounts: Discount[];
  } {
    return {
      coupons: [
        this.createPercentageCoupon(10, { code: `${name}10` }),
        this.createPercentageCoupon(20, { code: `${name}20` }),
        this.createFreeShippingCoupon({ code: `${name}SHIP` }),
      ],
      discounts: [
        this.createDiscount({
          title: `${name} Campaign - All Products`,
          type: 'percentage',
          value: 15,
          target: 'order',
          targetSelection: 'all',
          isActive: true,
        }),
      ],
    };
  }

  /**
   * Generate loyalty rewards coupons
   */
  static createLoyaltyCoupons(tiers: number = 3): Coupon[] {
    return Array.from({ length: tiers }, (_, i) => {
      const percentage = (i + 1) * 10;
      return this.createPercentageCoupon(percentage, {
        code: `LOYALTY${percentage}`,
        minPurchaseAmount: (i + 1) * 50,
      });
    });
  }
}
