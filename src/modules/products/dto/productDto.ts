import { z } from 'zod';

export const CreateProductDto = z.object({
  handle: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  vendor: z.string().max(255).optional(),
  productType: z.string().max(255).optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
});

export const UpdateProductDto = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  vendor: z.string().max(255).optional(),
  productType: z.string().max(255).optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
});

export const CreateVariantDto = z.object({
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

export const ListProductsQueryDto = z.object({
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  offset: z.string().transform(Number).pipe(z.number().min(0)).optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
});

export type CreateProductInput = z.infer<typeof CreateProductDto>;
export type UpdateProductInput = z.infer<typeof UpdateProductDto>;
export type CreateVariantInput = z.infer<typeof CreateVariantDto>;
export type ListProductsQuery = z.infer<typeof ListProductsQueryDto>;
