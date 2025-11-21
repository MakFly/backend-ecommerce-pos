/**
 * Order Models
 *
 * SOLID: Simple data models (POJOs)
 */

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'refunded' | 'partially_refunded';
export type FulfillmentStatus = 'unfulfilled' | 'processing' | 'fulfilled' | 'partially_fulfilled';

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  email: string;
  status: OrderStatus;
  financialStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  items: OrderItem[];
  subtotal: number;
  taxTotal: number;
  shippingTotal: number;
  discountTotal: number;
  total: number;
  currency: string;
  shippingAddress?: Address;
  billingAddress?: Address;
  notes?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  variantId: string;
  productId: string;
  title: string;
  sku: string;
  quantity: number;
  price: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  metadata?: Record<string, unknown>;
}

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone?: string;
}

export interface Cart {
  id: string;
  customerId?: string;
  items: CartItem[];
  subtotal: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  cartId: string;
  variantId: string;
  quantity: number;
  price: number;
}

// DTOs
export interface CreateOrderDto {
  customerId?: string;
  email: string;
  items: Array<{
    variantId: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress?: Address;
  billingAddress?: Address;
  notes?: string;
}

export interface UpdateOrderDto {
  status?: OrderStatus;
  financialStatus?: PaymentStatus;
  fulfillmentStatus?: FulfillmentStatus;
  notes?: string;
}

export interface AddToCartDto {
  variantId: string;
  quantity: number;
}
