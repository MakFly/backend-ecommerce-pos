import { z } from 'zod';

/**
 * Product Validator
 *
 * SOLID Principles:
 * - Single Responsibility Principle (SRP): Handles validation only
 * - Open/Closed Principle (OCP): Easy to extend with new schemas
 */

export const CreateProductSchema = z.object({
  handle: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  vendor: z.string().max(255).optional(),
  productType: z.string().max(255).optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
});

export const UpdateProductSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  vendor: z.string().max(255).optional(),
  productType: z.string().max(255).optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
});

export const CreateVariantSchema = z.object({
  sku: z.string().min(1).max(255),
  barcode: z.string().max(255).optional(),
  title: z.string().min(1).max(255),
  price: z.number().min(0),
  compareAtPrice: z.number().min(0).optional(),
  costPerItem: z.number().min(0).optional(),
  taxable: z.boolean().optional(),
  weight: z
    .object({
      value: z.number().min(0),
      unit: z.string(),
    })
    .optional(),
  requiresShipping: z.boolean().optional(),
});

export class ProductValidator {
  static validateCreate(data: unknown) {
    return CreateProductSchema.parse(data);
  }

  static validateUpdate(data: unknown) {
    return UpdateProductSchema.parse(data);
  }

  static validateCreateVariant(data: unknown) {
    return CreateVariantSchema.parse(data);
  }
}
