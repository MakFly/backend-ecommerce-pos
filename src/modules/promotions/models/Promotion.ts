export type DiscountType = 'percentage' | 'fixed' | 'buy_x_get_y' | 'free_shipping';
export type DiscountTarget = 'order' | 'product' | 'shipping';

export interface Coupon {
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  timesUsed: number;
  startsAt?: Date;
  endsAt?: Date;
  isActive: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface Discount {
  id: string;
  title: string;
  type: DiscountType;
  value: number;
  target: DiscountTarget;
  targetSelection: 'all' | 'specific';
  productIds?: string[];
  collectionIds?: string[];
  minPurchaseAmount?: number;
  startsAt?: Date;
  endsAt?: Date;
  isActive: boolean;
  priority: number;
}

export interface ValidateCouponDto {
  code: string;
  orderTotal: number;
}

export interface CouponValidation {
  valid: boolean;
  coupon?: Coupon;
  discountAmount?: number;
  error?: string;
}

export interface ApplyDiscountsDto {
  orderTotal: number;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  couponCode?: string;
}

export interface DiscountResult {
  total: number;
  discounts: Array<{
    name: string;
    amount: number;
    type: string;
  }>;
}
