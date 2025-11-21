import { Coupon, Discount } from '../models/Promotion.js';

/**
 * Promotion Repository Interface
 */
export interface ICouponRepository {
  findById(id: string): Promise<Coupon | null>;
  findByCode(code: string): Promise<Coupon | null>;
  findAll(filters?: { isActive?: boolean; limit?: number }): Promise<Coupon[]>;
  save(coupon: Coupon): Promise<void>;
  incrementUsage(id: string): Promise<void>;
}

export interface IDiscountRepository {
  findById(id: string): Promise<Discount | null>;
  findAll(filters?: { isActive?: boolean; limit?: number }): Promise<Discount[]>;
  findActive(): Promise<Discount[]>;
  save(discount: Discount): Promise<void>;
}
