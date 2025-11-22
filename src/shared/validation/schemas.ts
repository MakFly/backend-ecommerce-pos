import { z } from 'zod';

/**
 * Common Validation Schemas
 *
 * Reusable Zod schemas for validation across the application
 */

// ============================================================================
// COMMON SCHEMAS
// ============================================================================

export const AddressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  company: z.string().optional(),
  street1: z.string().min(1, 'Street address is required'),
  street2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  region: z.string().min(1, 'Region/state is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().length(2, 'Country must be 2-letter code (e.g., US, CA)'),
  phone: z.string().optional(),
});

// ============================================================================
// AUTH SCHEMAS
// ============================================================================

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ============================================================================
// ORDER SCHEMAS
// ============================================================================

export const CreateOrderSchema = z.object({
  customerId: z.string().uuid().optional(),
  email: z.string().email('Invalid email address'),
  items: z
    .array(
      z.object({
        variantId: z.string().uuid('Invalid variant ID'),
        productId: z.string().uuid('Invalid product ID'),
        title: z.string().min(1, 'Product title is required'),
        sku: z.string().min(1, 'SKU is required'),
        quantity: z.number().int().positive('Quantity must be positive'),
        price: z.number().nonnegative('Price must be non-negative'),
      })
    )
    .min(1, 'At least one item is required'),
  shippingAddress: AddressSchema,
  billingAddress: AddressSchema,
  paymentMethod: z.string().min(1, 'Payment method is required'),
  shippingMethod: z.string().min(1, 'Shipping method is required'),
  currency: z.string().length(3, 'Currency must be 3-letter code (e.g., USD, EUR)').default('USD'),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
});

export const UpdateOrderStatusSchema = z.object({
  status: z.enum([
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded',
  ]),
});

// ============================================================================
// PRODUCT SCHEMAS
// ============================================================================

export const CreateProductSchema = z.object({
  title: z.string().min(1, 'Product title is required'),
  description: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  tags: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  variants: z
    .array(
      z.object({
        sku: z.string().min(1, 'SKU is required'),
        barcode: z.string().optional(),
        price: z.number().nonnegative('Price must be non-negative'),
        compareAtPrice: z.number().nonnegative().optional(),
        costPerItem: z.number().nonnegative().optional(),
        weight: z.number().nonnegative().optional(),
        weightUnit: z.string().default('kg'),
        inventoryQuantity: z.number().int().nonnegative().default(0),
        options: z.record(z.string()).default({}),
      })
    )
    .min(1, 'At least one variant is required'),
});

export const UpdateProductSchema = CreateProductSchema.partial();

// ============================================================================
// INVENTORY SCHEMAS
// ============================================================================

export const ReserveStockSchema = z.object({
  variantId: z.string().uuid('Invalid variant ID'),
  warehouseId: z.string().uuid('Invalid warehouse ID'),
  quantity: z.number().int().positive('Quantity must be positive'),
  orderId: z.string().uuid().optional(),
});

export const ReleaseStockSchema = z.object({
  variantId: z.string().uuid('Invalid variant ID'),
  warehouseId: z.string().uuid('Invalid warehouse ID'),
  quantity: z.number().int().positive('Quantity must be positive'),
  orderId: z.string().uuid().optional(),
});

export const AdjustStockSchema = z.object({
  variantId: z.string().uuid('Invalid variant ID'),
  warehouseId: z.string().uuid('Invalid warehouse ID'),
  quantity: z.number().int('Quantity must be an integer'),
  reason: z.string().min(1, 'Reason is required'),
});

// ============================================================================
// POS SCHEMAS
// ============================================================================

export const CreatePOSSaleSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  customerId: z.string().uuid().optional(),
  items: z
    .array(
      z.object({
        variantId: z.string().uuid('Invalid variant ID'),
        productTitle: z.string().min(1, 'Product title is required'),
        sku: z.string().min(1, 'SKU is required'),
        quantity: z.number().int().positive('Quantity must be positive'),
        price: z.number().nonnegative('Price must be non-negative'),
        discount: z.number().nonnegative().default(0),
      })
    )
    .min(1, 'At least one item is required'),
  payments: z
    .array(
      z.object({
        method: z.enum(['cash', 'card', 'mobile', 'other']),
        amount: z.number().positive('Payment amount must be positive'),
        reference: z.string().optional(),
      })
    )
    .min(1, 'At least one payment is required'),
  discountTotal: z.number().nonnegative().default(0),
  taxTotal: z.number().nonnegative().default(0),
  notes: z.string().optional(),
});

export const OpenSessionSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  registerId: z.string().min(1, 'Register ID is required'),
  openingCash: z.number().nonnegative('Opening cash must be non-negative'),
});

export const CloseSessionSchema = z.object({
  closingCash: z.number().nonnegative('Closing cash must be non-negative'),
  notes: z.string().optional(),
});

// ============================================================================
// PROMOTION SCHEMAS
// ============================================================================

export const ValidateCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required'),
  orderTotal: z.number().nonnegative('Order total must be non-negative'),
});

export const CreateCouponSchema = z.object({
  code: z.string().min(3, 'Coupon code must be at least 3 characters'),
  type: z.enum(['percentage', 'fixed', 'free_shipping']),
  value: z.number().nonnegative('Value must be non-negative'),
  minPurchaseAmount: z.number().nonnegative().optional(),
  maxDiscountAmount: z.number().nonnegative().optional(),
  usageLimit: z.number().int().positive().optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
});

// ============================================================================
// SHIPPING SCHEMAS
// ============================================================================

export const CalculateShippingSchema = z.object({
  destinationCountry: z.string().length(2, 'Country must be 2-letter code'),
  destinationRegion: z.string().optional(),
  destinationCity: z.string().optional(),
  orderTotal: z.number().nonnegative('Order total must be non-negative'),
  weight: z.number().nonnegative().optional(),
  items: z
    .array(
      z.object({
        quantity: z.number().int().positive(),
        weight: z.number().nonnegative().optional(),
      })
    )
    .optional(),
});

// ============================================================================
// TAX SCHEMAS
// ============================================================================

export const CalculateTaxSchema = z.object({
  country: z.string().length(2, 'Country must be 2-letter code'),
  region: z.string().optional(),
  amount: z.number().nonnegative('Amount must be non-negative'),
});
