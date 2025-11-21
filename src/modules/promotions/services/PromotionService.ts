import {
  ValidateCouponDto,
  CouponValidation,
  Coupon,
  ApplyDiscountsDto,
  DiscountResult,
} from '../models/Promotion.js';

export class PromotionService {
  async validateCoupon(dto: ValidateCouponDto): Promise<CouponValidation> {
    // Get coupon from DB
    const coupon = await this.findCouponByCode(dto.code);

    if (!coupon) {
      return {
        valid: false,
        error: 'Coupon not found',
      };
    }

    if (!coupon.isActive) {
      return {
        valid: false,
        error: 'Coupon is not active',
      };
    }

    if (coupon.endsAt && coupon.endsAt < new Date()) {
      return {
        valid: false,
        error: 'Coupon has expired',
      };
    }

    if (coupon.minPurchaseAmount && dto.orderTotal < coupon.minPurchaseAmount) {
      return {
        valid: false,
        error: `Minimum purchase amount is ${coupon.minPurchaseAmount}`,
      };
    }

    if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) {
      return {
        valid: false,
        error: 'Coupon usage limit reached',
      };
    }

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

    // Apply coupon if provided
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
      }
    }

    // Apply automatic discounts (TODO: implement)

    return {
      total,
      discounts,
    };
  }

  private async findCouponByCode(code: string): Promise<Coupon | null> {
    // Mock implementation
    if (code === 'SAVE10') {
      return {
        id: 'coupon-1',
        code: 'SAVE10',
        type: 'percentage',
        value: 10,
        timesUsed: 0,
        isActive: true,
        createdAt: new Date(),
      };
    }
    return null;
  }

  private calculateCouponDiscount(coupon: Coupon, orderTotal: number): number {
    let discount = 0;

    if (coupon.type === 'percentage') {
      discount = (orderTotal * coupon.value) / 100;
    } else if (coupon.type === 'fixed') {
      discount = coupon.value;
    }

    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }

    return Math.min(discount, orderTotal);
  }
}
