import { Product } from '../domain/Product.js';
import { Variant } from '../domain/Variant.js';
import { Money } from '../domain/Money.js';
import { ProductRepository } from '../repository/ProductRepository.js';
import { eventBus } from '@core/infrastructure/eventBus.js';
import { NotFoundError, ConflictError } from '@shared/errors/AppError.js';

export class ProductService {
  constructor(private productRepository: ProductRepository) {}

  async createProduct(input: {
    handle: string;
    title: string;
    description?: string;
    vendor?: string;
    productType?: string;
    status?: 'draft' | 'active' | 'archived';
  }): Promise<Product> {
    // Check if handle already exists
    const existing = await this.productRepository.findByHandle(input.handle);
    if (existing) {
      throw new ConflictError(`Product with handle '${input.handle}' already exists`);
    }

    const product = Product.create({
      handle: input.handle,
      title: input.title,
      description: input.description,
      status: input.status || 'draft',
      vendor: input.vendor,
      productType: input.productType,
    });

    await this.productRepository.save(product);

    // Publish domain events
    for (const event of product.domainEvents) {
      await eventBus.publish(`product.${event.eventType}`, event);
    }
    product.clearEvents();

    return product;
  }

  async updateProduct(
    id: string,
    input: {
      title?: string;
      description?: string;
      vendor?: string;
      productType?: string;
      status?: 'draft' | 'active' | 'archived';
    }
  ): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundError('Product', id);
    }

    product.update(input);
    await this.productRepository.save(product);

    for (const event of product.domainEvents) {
      await eventBus.publish(`product.${event.eventType}`, event);
    }
    product.clearEvents();

    return product;
  }

  async addVariant(
    productId: string,
    input: {
      sku: string;
      barcode?: string;
      title: string;
      price: number;
      compareAtPrice?: number;
      costPerItem?: number;
      taxable?: boolean;
      weight?: { value: number; unit: string };
      requiresShipping?: boolean;
    }
  ): Promise<Product> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundError('Product', productId);
    }

    const variant = Variant.create({
      productId,
      sku: input.sku,
      barcode: input.barcode,
      title: input.title,
      price: Money.create(input.price, 'USD'),
      compareAtPrice: input.compareAtPrice
        ? Money.create(input.compareAtPrice, 'USD')
        : undefined,
      costPerItem: input.costPerItem ? Money.create(input.costPerItem, 'USD') : undefined,
      taxable: input.taxable ?? true,
      weight: input.weight,
      requiresShipping: input.requiresShipping ?? true,
    });

    product.addVariant(variant);
    await this.productRepository.save(product);

    return product;
  }

  async getProduct(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundError('Product', id);
    }
    return product;
  }

  async listProducts(options?: {
    limit?: number;
    offset?: number;
    status?: string;
  }): Promise<Product[]> {
    if (options?.status) {
      return this.productRepository.findMany({ status: options.status });
    }
    return this.productRepository.findAll({
      limit: options?.limit,
      offset: options?.offset,
    });
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundError('Product', id);
    }
    await this.productRepository.delete(id);
  }
}
