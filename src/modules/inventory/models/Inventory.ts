export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  isActive: boolean;
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
  updatedAt: Date;
}

export interface StockMovement {
  id: string;
  variantId: string;
  warehouseId: string;
  type: StockMovementType;
  quantity: number;
  referenceType?: string;
  referenceId?: string;
  note?: string;
  createdAt: Date;
}

export type StockMovementType =
  | 'received'
  | 'sold'
  | 'reserved'
  | 'released'
  | 'adjustment'
  | 'damaged'
  | 'returned'
  | 'transfer';

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
  note?: string;
}

export interface ReserveStockDto {
  variantId: string;
  warehouseId: string;
  quantity: number;
  referenceType: string;
  referenceId: string;
}
