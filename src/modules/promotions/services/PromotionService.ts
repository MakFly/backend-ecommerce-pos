import {
  ValidateCouponDto,
  CouponValidation,
  Coupon,
  Discount,
  ApplyDiscountsDto,
  DiscountResult,
} from '../models/Promotion.js';
import { ICouponRepository, IDiscountRepository } from '../repositories/IPromotionRepository.js';

/**
 * Promotion Service
 *
 * SOLID Principles:
 * - Single Responsibility: Promotion and discount logic only
 * - Dependency Inversion: Depends on repository abstractions
 */
export class PromotionService {
  constructor(
    private readonly couponRepo: ICouponRepository,
    private readonly discountRepo: IDiscountRepository
  ) {}

  async validateCoupon(dto: ValidateCouponDto): Promise<CouponValidation> {
    // 1. Get coupon from DB
    const coupon = await this.couponRepo.findByCode(dto.code);

    if (!coupon) {
      return {
        valid: false,
        error: 'Coupon not found',
      };
    }

    // 2. Check if active
    if (!coupon.isActive) {
      return {
        valid: false,
        error: 'Coupon is not active',
      };
    }

    // 3. Check expiration
    if (coupon.startsAt && coupon.startsAt > new Date()) {
      return {
        valid: false,
        error: 'Coupon is not yet valid',
      };
    }

    if (coupon.endsAt && coupon.endsAt < new Date()) {
      return {
        valid: false,
        error: 'Coupon has expired',
      };
    }

    // 4. Check minimum purchase
    if (coupon.minPurchaseAmount && dto.orderTotal < coupon.minPurchaseAmount) {
      return {
        valid: false,
        error: `Minimum purchase amount is ${coupon.minPurchaseAmount}`,
      };
    }

    // 5. Check usage limit
    if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) {
      return {
        valid: false,
        error: 'Coupon usage limit reached',
      };
    }

    // 6. Calculate discount
    const discountAmount = this.calculateCouponDiscount(coupon, dto.orderTotal);

    return {
      valid: true,
      coupon,
      discountAmount,
    };
  }

  async applyDiscounts(dto: ApplyDiscountsDto): Promise<DiscountResult> {
    let total = dto.orderTotal;
    const discounts: Array<{ name: string; amount: number; type: string }> = [];

    // 1. Apply coupon if provided
    if (dto.couponCode) {
      const validation = await this.validateCoupon({
        code: dto.couponCode,
        orderTotal: total,
      });

      if (validation.valid && validation.discountAmount) {
        discounts.push({
          name: `Coupon: ${dto.couponCode}`,
          amount: validation.discountAmount,
          type: 'coupon',
        });
        total -= validation.discountAmount;

        // Increment coupon usage
        if (validation.coupon) {
          await this.couponRepo.incrementUsage(validation.coupon.id);
        }
      }
    }

    // 2. Apply automatic discounts
    const activeDiscounts = await this.discountRepo.findActive();

    for (const discount of activeDiscounts) {
      if (discount.minPurchaseAmount && total < discount.minPurchaseAmount) {
        continue;
      }

      const discountAmount = this.calculateDiscountAmount(discount, total);

      if (discountAmount > 0) {
        discounts.push({
          name: discount.title,
          amount: discountAmount,
          type: discount.type,
        });
        total -= discountAmount;
      }
    }

    return {
      total,
      discounts,
    };
  }

  async listCoupons(filters?: { isActive?: boolean; limit?: number }): Promise<Coupon[]> {
    return this.couponRepo.findAll(filters);
  }

  async getCoupon(code: string): Promise<Coupon | null> {
    return this.couponRepo.findByCode(code);
  }

  async listDiscounts(filters?: { isActive?: boolean; limit?: number }): Promise<Discount[]> {
    return this.discountRepo.findAll(filters);
  }

  async createCoupon(coupon: Coupon): Promise<Coupon> {
    await this.couponRepo.save(coupon);
    return coupon;
  }

  private calculateCouponDiscount(coupon: Coupon, orderTotal: number): number {
    let discount = 0;

    if (coupon.type === 'percentage') {
      discount = (orderTotal * coupon.value) / 100;
    } else if (coupon.type === 'fixed') {
      discount = coupon.value;
    } else if (coupon.type === 'free_shipping') {
      // Free shipping is handled separately in order flow
      discount = 0;
    }

    // Apply max discount cap if exists
    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }

    // Can't discount more than order total
    return Math.min(discount, orderTotal);
  }

  private calculateDiscountAmount(discount: Discount, orderTotal: number): number {
    let discountAmount = 0;

    if (discount.type === 'percentage') {
      discountAmount = (orderTotal * discount.value) / 100;
    } else if (discount.type === 'fixed') {
      discountAmount = discount.value;
    }

    return Math.min(discountAmount, orderTotal);
  }
}
