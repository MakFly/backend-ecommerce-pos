import { Context } from 'hono';
import { ProductService } from '../services/ProductService.js';
import { IController, ApiResponse } from '@shared/interfaces/IController.js';
import { Product, CreateProductDto, UpdateProductDto } from '../models/Product.js';

/**
 * Product Controller
 *
 * SOLID Principles:
 * - Single Responsibility Principle (SRP): Handles HTTP layer only
 * - Dependency Inversion Principle (DIP): Depends on ProductService interface
 */
export class ProductController implements IController {
  constructor(private readonly service: ProductService) {}

  /**
   * GET /products
   */
  async list(c: Context): Promise<Response> {
    const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!) : undefined;
    const offset = c.req.query('offset') ? parseInt(c.req.query('offset')!) : undefined;

    const products = await this.service.listProducts({ limit, offset });

    const response: ApiResponse<Product[]> = {
      data: products,
      meta: {
        count: products.length,
      },
    };

    return c.json(response);
  }

  /**
   * GET /products/:id
   */
  async get(c: Context): Promise<Response> {
    const id = c.req.param('id');
    const product = await this.service.getProduct(id);

    const response: ApiResponse<Product> = {
      data: product,
    };

    return c.json(response);
  }

  /**
   * POST /products
   */
  async create(c: Context): Promise<Response> {
    const dto: CreateProductDto = await c.req.json();
    const product = await this.service.createProduct(dto);

    const response: ApiResponse<Product> = {
      data: product,
    };

    return c.json(response, 201);
  }

  /**
   * PATCH /products/:id
   */
  async update(c: Context): Promise<Response> {
    const id = c.req.param('id');
    const dto: UpdateProductDto = await c.req.json();
    const product = await this.service.updateProduct(id, dto);

    const response: ApiResponse<Product> = {
      data: product,
    };

    return c.json(response);
  }

  /**
   * DELETE /products/:id
   */
  async delete(c: Context): Promise<Response> {
    const id = c.req.param('id');
    await this.service.deleteProduct(id);

    return c.json({ message: 'Product deleted successfully' });
  }
}
