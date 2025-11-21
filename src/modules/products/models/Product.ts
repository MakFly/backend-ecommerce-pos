/**
 * Product Model (POJO - Plain Old JavaScript Object)
 *
 * SOLID Principles:
 * - Single Responsibility Principle (SRP): Only holds data, no business logic
 */
export interface Product {
  id: string;
  handle: string;
  title: string;
  description?: string;
  status: ProductStatus;
  vendor?: string;
  productType?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductStatus = 'draft' | 'active' | 'archived';

/**
 * Product Variant Model
 */
export interface Variant {
  id: string;
  productId: string;
  sku: string;
  barcode?: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  costPerItem?: number;
  taxable: boolean;
  weight?: {
    value: number;
    unit: string;
  };
  requiresShipping: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTOs (Data Transfer Objects)
 */
export interface CreateProductDto {
  handle: string;
  title: string;
  description?: string;
  vendor?: string;
  productType?: string;
  status?: ProductStatus;
}

export interface UpdateProductDto {
  title?: string;
  description?: string;
  vendor?: string;
  productType?: string;
  status?: ProductStatus;
}

export interface CreateVariantDto {
  sku: string;
  barcode?: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  costPerItem?: number;
  taxable?: boolean;
  weight?: {
    value: number;
    unit: string;
  };
  requiresShipping?: boolean;
}
