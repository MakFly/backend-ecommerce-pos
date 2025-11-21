import { Hono } from 'hono';
import { ProductService } from '../service/ProductService.js';
import { ProductRepository } from '../repository/ProductRepository.js';
import { authenticate, authorize } from '@shared/middleware/auth.js';
import { validateBody, validateQuery } from '@shared/validation/zodValidator.js';
import {
  CreateProductDto,
  UpdateProductDto,
  CreateVariantDto,
  ListProductsQueryDto,
} from '../dto/productDto.js';

const productRoutes = new Hono();
const productRepository = new ProductRepository();
const productService = new ProductService(productRepository);

// GET /products - List products
productRoutes.get(
  '/',
  authenticate(),
  validateQuery(ListProductsQueryDto),
  async (c) => {
    const query = c.get('validatedQuery') as any;
    const products = await productService.listProducts(query);

    return c.json({
      data: products.map((p) => ({
        id: p.id,
        handle: p.handle,
        title: p.title,
        description: p.description,
        status: p.status,
        vendor: p.vendor,
        productType: p.productType,
        variantsCount: p.variants.length,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
    });
  }
);

// GET /products/:id - Get product by ID
productRoutes.get(
  '/:id',
  authenticate(),
  async (c) => {
    const id = c.req.param('id');
    const product = await productService.getProduct(id);

    return c.json({
      data: {
        id: product.id,
        handle: product.handle,
        title: product.title,
        description: product.description,
        status: product.status,
        vendor: product.vendor,
        productType: product.productType,
        metadata: product.metadata,
        variants: product.variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          barcode: v.barcode,
          title: v.title,
          price: v.price.amount,
          currency: v.price.currency,
          taxable: v.taxable,
        })),
        images: product.images,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
    });
  }
);

// POST /products - Create product
productRoutes.post(
  '/',
  authenticate(),
  authorize('ADMIN', 'STAFF'),
  validateBody(CreateProductDto),
  async (c) => {
    const body = c.get('validatedBody') as any;
    const product = await productService.createProduct(body);

    return c.json(
      {
        data: {
          id: product.id,
          handle: product.handle,
          title: product.title,
          status: product.status,
        },
      },
      201
    );
  }
);

// PATCH /products/:id - Update product
productRoutes.patch(
  '/:id',
  authenticate(),
  authorize('ADMIN', 'STAFF'),
  validateBody(UpdateProductDto),
  async (c) => {
    const id = c.req.param('id');
    const body = c.get('validatedBody') as any;
    const product = await productService.updateProduct(id, body);

    return c.json({
      data: {
        id: product.id,
        title: product.title,
        status: product.status,
        updatedAt: product.updatedAt,
      },
    });
  }
);

// DELETE /products/:id - Delete product
productRoutes.delete(
  '/:id',
  authenticate(),
  authorize('ADMIN'),
  async (c) => {
    const id = c.req.param('id');
    await productService.deleteProduct(id);
    return c.json({ message: 'Product deleted successfully' }, 200);
  }
);

// POST /products/:id/variants - Add variant to product
productRoutes.post(
  '/:id/variants',
  authenticate(),
  authorize('ADMIN', 'STAFF'),
  validateBody(CreateVariantDto),
  async (c) => {
    const productId = c.req.param('id');
    const body = c.get('validatedBody') as any;
    const product = await productService.addVariant(productId, body);

    return c.json(
      {
        data: {
          productId: product.id,
          variantsCount: product.variants.length,
        },
      },
      201
    );
  }
);

export { productRoutes };
