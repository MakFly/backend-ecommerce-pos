export type POSSessionStatus = 'open' | 'closed';
export type POSPaymentMethod = 'cash' | 'card' | 'other';

export interface POSSession {
  id: string;
  sessionNumber: string;
  userId: string;
  warehouseId: string;
  status: POSSessionStatus;
  openingCash: number;
  closingCash?: number;
  expectedCash?: number;
  difference?: number;
  openedAt: Date;
  closedAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface POSSale {
  id: string;
  saleNumber: string;
  sessionId: string;
  customerId?: string;
  items: POSSaleItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  paymentMethod: POSPaymentMethod;
  amountPaid: number;
  change: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface POSSaleItem {
  id: string;
  saleId: string;
  variantId: string;
  title: string;
  sku: string;
  quantity: number;
  price: number;
  discountAmount: number;
  total: number;
}

export interface OpenSessionDto {
  userId: string;
  warehouseId: string;
  openingCash: number;
}

export interface CloseSessionDto {
  closingCash: number;
}

export interface CreatePOSSaleDto {
  sessionId: string;
  customerId?: string;
  items: Array<{
    variantId: string;
    quantity: number;
    price: number;
  }>;
  paymentMethod: POSPaymentMethod;
  amountPaid: number;
}
