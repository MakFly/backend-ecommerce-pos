import { nanoid } from 'nanoid';
import { IProductRepository } from '../repositories/IProductRepository.js';
import { Product, CreateProductDto, UpdateProductDto } from '../models/Product.js';
import { ICrudService, QueryOptions } from '@shared/interfaces/IService.js';

/**
 * Product Service
 *
 * SOLID Principles:
 * - Single Responsibility Principle (SRP): Handles product business logic only
 * - Dependency Inversion Principle (DIP): Depends on IProductRepository interface
 * - Open/Closed Principle (OCP): Extensible without modification
 */
export class ProductService implements ICrudService<Product, CreateProductDto, UpdateProductDto> {
  constructor(private readonly repository: IProductRepository) {}

  /**
   * Create a new product
   * TDD: Test written first in ProductService.test.ts
   */
  async createProduct(dto: CreateProductDto): Promise<Product> {
    // Business rule: Handle must be unique
    const existing = await this.repository.findByHandle(dto.handle);
    if (existing) {
      throw new Error(`Product with handle "${dto.handle}" already exists`);
    }

    const product: Product = {
      id: nanoid(),
      handle: dto.handle,
      title: dto.title,
      description: dto.description,
      status: dto.status || 'draft', // Default status
      vendor: dto.vendor,
      productType: dto.productType,
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.repository.save(product);
    return product;
  }

  /**
   * Get product by ID
   */
  async getProduct(id: string): Promise<Product> {
    const product = await this.repository.findById(id);
    if (!product) {
      throw new Error(`Product with id ${id} not found`);
    }
    return product;
  }

  /**
   * Update product
   */
  async updateProduct(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.getProduct(id);

    const updated: Product = {
      ...product,
      ...dto,
      updatedAt: new Date(),
    };

    await this.repository.update(id, updated);
    return updated;
  }

  /**
   * Delete product
   */
  async deleteProduct(id: string): Promise<void> {
    await this.getProduct(id); // Throws if not found
    await this.repository.delete(id);
  }

  /**
   * List all products
   */
  async listProducts(options?: QueryOptions): Promise<Product[]> {
    return this.repository.findAll(options);
  }

  // Alias methods for ICrudService interface
  create = this.createProduct;
  getById = this.getProduct;
  getAll = this.listProducts;
  update = this.updateProduct;
  delete = this.deleteProduct;
}
