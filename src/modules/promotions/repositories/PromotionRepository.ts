import { ICouponRepository, IDiscountRepository } from './IPromotionRepository.js';
import { Coupon, Discount } from '../models/Promotion.js';
import { IDatabase } from '@shared/interfaces/IDatabase.js';

/**
 * Coupon Repository
 */
export class CouponRepository implements ICouponRepository {
  constructor(private readonly db: IDatabase) {}

  async findById(id: string): Promise<Coupon | null> {
    const rows = await this.db.query<any>(
      `SELECT * FROM coupons WHERE id = $1`,
      [id]
    );
    return rows.length > 0 ? this.mapToCoupon(rows[0]) : null;
  }

  async findByCode(code: string): Promise<Coupon | null> {
    const rows = await this.db.query<any>(
      `SELECT * FROM coupons WHERE code = $1`,
      [code]
    );
    return rows.length > 0 ? this.mapToCoupon(rows[0]) : null;
  }

  async findAll(filters?: { isActive?: boolean; limit?: number }): Promise<Coupon[]> {
    let query = `SELECT * FROM coupons`;
    const params: any[] = [];

    if (filters?.isActive !== undefined) {
      query += ` WHERE is_active = $1`;
      params.push(filters.isActive);
    }

    query += ` ORDER BY created_at DESC`;

    if (filters?.limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(filters.limit);
    }

    const rows = await this.db.query<any>(query, params);
    return rows.map(this.mapToCoupon);
  }

  async save(coupon: Coupon): Promise<void> {
    await this.db.execute(
      `INSERT INTO coupons (
        id, code, type, value, min_purchase_amount, max_discount_amount,
        usage_limit, times_used, starts_at, ends_at, is_active, metadata, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (id) DO UPDATE SET
        code = $2, type = $3, value = $4, min_purchase_amount = $5,
        max_discount_amount = $6, usage_limit = $7, times_used = $8,
        starts_at = $9, ends_at = $10, is_active = $11, metadata = $12`,
      [
        coupon.id,
        coupon.code,
        coupon.type,
        coupon.value,
        coupon.minPurchaseAmount,
        coupon.maxDiscountAmount,
        coupon.usageLimit,
        coupon.timesUsed,
        coupon.startsAt,
        coupon.endsAt,
        coupon.isActive,
        JSON.stringify(coupon.metadata),
        coupon.createdAt,
      ]
    );
  }

  async incrementUsage(id: string): Promise<void> {
    await this.db.execute(
      `UPDATE coupons SET times_used = times_used + 1 WHERE id = $1`,
      [id]
    );
  }

  private mapToCoupon(row: any): Coupon {
    return {
      id: row.id,
      code: row.code,
      type: row.type,
      value: parseFloat(row.value),
      minPurchaseAmount: row.min_purchase_amount ? parseFloat(row.min_purchase_amount) : undefined,
      maxDiscountAmount: row.max_discount_amount ? parseFloat(row.max_discount_amount) : undefined,
      usageLimit: row.usage_limit,
      timesUsed: row.times_used,
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      isActive: row.is_active,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
      createdAt: row.created_at,
    };
  }
}

/**
 * Discount Repository
 */
export class DiscountRepository implements IDiscountRepository {
  constructor(private readonly db: IDatabase) {}

  async findById(id: string): Promise<Discount | null> {
    const rows = await this.db.query<any>(
      `SELECT * FROM discounts WHERE id = $1`,
      [id]
    );
    return rows.length > 0 ? this.mapToDiscount(rows[0]) : null;
  }

  async findAll(filters?: { isActive?: boolean; limit?: number }): Promise<Discount[]> {
    let query = `SELECT * FROM discounts`;
    const params: any[] = [];

    if (filters?.isActive !== undefined) {
      query += ` WHERE is_active = $1`;
      params.push(filters.isActive);
    }

    query += ` ORDER BY priority ASC`;

    if (filters?.limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(filters.limit);
    }

    const rows = await this.db.query<any>(query, params);
    return rows.map(this.mapToDiscount);
  }

  async findActive(): Promise<Discount[]> {
    const rows = await this.db.query<any>(
      `SELECT * FROM discounts
       WHERE is_active = true
         AND (starts_at IS NULL OR starts_at <= NOW())
         AND (ends_at IS NULL OR ends_at >= NOW())
       ORDER BY priority ASC`
    );
    return rows.map(this.mapToDiscount);
  }

  async save(discount: Discount): Promise<void> {
    await this.db.execute(
      `INSERT INTO discounts (
        id, title, type, value, target, target_selection, product_ids,
        collection_ids, min_purchase_amount, starts_at, ends_at, is_active, priority
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (id) DO UPDATE SET
        title = $2, type = $3, value = $4, target = $5, target_selection = $6,
        product_ids = $7, collection_ids = $8, min_purchase_amount = $9,
        starts_at = $10, ends_at = $11, is_active = $12, priority = $13`,
      [
        discount.id,
        discount.title,
        discount.type,
        discount.value,
        discount.target,
        discount.targetSelection,
        discount.productIds,
        discount.collectionIds,
        discount.minPurchaseAmount,
        discount.startsAt,
        discount.endsAt,
        discount.isActive,
        discount.priority,
      ]
    );
  }

  private mapToDiscount(row: any): Discount {
    return {
      id: row.id,
      title: row.title,
      type: row.type,
      value: parseFloat(row.value),
      target: row.target,
      targetSelection: row.target_selection,
      productIds: row.product_ids,
      collectionIds: row.collection_ids,
      minPurchaseAmount: row.min_purchase_amount ? parseFloat(row.min_purchase_amount) : undefined,
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      isActive: row.is_active,
      priority: row.priority,
    };
  }
}
