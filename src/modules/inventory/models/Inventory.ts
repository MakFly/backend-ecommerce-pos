export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address: {
    address1: string;
    address2?: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockLevel {
  id: string;
  variantId: string;
  warehouseId: string;
  available: number;
  reserved: number;
  incoming: number;
  onHand: number;
}

export interface StockMovement {
  id: string;
  variantId: string;
  warehouseId: string;
  type: MovementType;
  quantity: number;
  reason?: string;
  reference?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export type MovementType =
  | 'purchase'
  | 'sale'
  | 'adjustment'
  | 'transfer'
  | 'return'
  | 'damaged';

export interface CreateWarehouseDto {
  code: string;
  name: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface AdjustStockDto {
  variantId: string;
  warehouseId: string;
  quantity: number;
  reason?: string;
}

export interface ReserveStockDto {
  variantId: string;
  warehouseId: string;
  quantity: number;
  reference?: string;
}
