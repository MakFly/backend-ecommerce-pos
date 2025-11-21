/**
 * Product Service Tests (TDD)
 *
 * Test-Driven Development:
 * 1. Write test first (RED)
 * 2. Write minimal code to pass (GREEN)
 * 3. Refactor (REFACTOR)
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductService } from '../services/ProductService.js';
import { IProductRepository } from '../repositories/IProductRepository.js';
import { Product, CreateProductDto } from '../models/Product.js';

// Mock repository (Test Double)
class MockProductRepository implements IProductRepository {
  private products: Product[] = [];

  async findById(id: string): Promise<Product | null> {
    return this.products.find((p) => p.id === id) || null;
  }

  async findByHandle(handle: string): Promise<Product | null> {
    return this.products.find((p) => p.handle === handle) || null;
  }

  async findAll(): Promise<Product[]> {
    return this.products;
  }

  async save(product: Product): Promise<void> {
    this.products.push(product);
  }

  async update(id: string, data: Partial<Product>): Promise<void> {
    const index = this.products.findIndex((p) => p.id === id);
    if (index !== -1) {
      this.products[index] = { ...this.products[index], ...data };
    }
  }

  async delete(id: string): Promise<void> {
    this.products = this.products.filter((p) => p.id !== id);
  }

  async findBy(criteria: Record<string, unknown>): Promise<Product[]> {
    return this.products;
  }

  async count(): Promise<number> {
    return this.products.length;
  }

  async findBySku(): Promise<any> {
    return null;
  }

  async getVariants(): Promise<any[]> {
    return [];
  }

  async saveVariant(): Promise<void> {}
}

describe('ProductService (TDD)', () => {
  let service: ProductService;
  let repository: MockProductRepository;

  beforeEach(() => {
    repository = new MockProductRepository();
    service = new ProductService(repository);
  });

  /**
   * TEST 1: Create Product
   * SOLID: Service uses interface (DIP), single responsibility (SRP)
   */
  describe('createProduct', () => {
    it('should create a product with valid data', async () => {
      // Arrange
      const dto: CreateProductDto = {
        handle: 'test-product',
        title: 'Test Product',
        description: 'A test product',
        status: 'draft',
      };

      // Act
      const product = await service.createProduct(dto);

      // Assert
      expect(product.id).toBeDefined();
      expect(product.handle).toBe('test-product');
      expect(product.title).toBe('Test Product');
      expect(product.status).toBe('draft');
      expect(product.createdAt).toBeInstanceOf(Date);
    });

    it('should throw error if handle already exists', async () => {
      // Arrange
      const dto: CreateProductDto = {
        handle: 'duplicate-handle',
        title: 'Product 1',
      };

      await service.createProduct(dto);

      // Act & Assert
      await expect(
        service.createProduct({ handle: 'duplicate-handle', title: 'Product 2' })
      ).rejects.toThrow('Product with handle "duplicate-handle" already exists');
    });

    it('should set default status to draft if not provided', async () => {
      // Arrange
      const dto: CreateProductDto = {
        handle: 'no-status',
        title: 'No Status Product',
      };

      // Act
      const product = await service.createProduct(dto);

      // Assert
      expect(product.status).toBe('draft');
    });
  });

  /**
   * TEST 2: Get Product
   */
  describe('getProduct', () => {
    it('should return product by id', async () => {
      // Arrange
      const created = await service.createProduct({
        handle: 'test',
        title: 'Test',
      });

      // Act
      const product = await service.getProduct(created.id);

      // Assert
      expect(product.id).toBe(created.id);
      expect(product.title).toBe('Test');
    });

    it('should throw error if product not found', async () => {
      // Act & Assert
      await expect(service.getProduct('non-existent-id')).rejects.toThrow(
        'Product with id non-existent-id not found'
      );
    });
  });

  /**
   * TEST 3: Update Product
   */
  describe('updateProduct', () => {
    it('should update product fields', async () => {
      // Arrange
      const created = await service.createProduct({
        handle: 'test',
        title: 'Original Title',
      });

      // Act
      const updated = await service.updateProduct(created.id, {
        title: 'Updated Title',
        description: 'New description',
      });

      // Assert
      expect(updated.title).toBe('Updated Title');
      expect(updated.description).toBe('New description');
      expect(updated.handle).toBe('test'); // Unchanged
    });
  });

  /**
   * TEST 4: Delete Product
   */
  describe('deleteProduct', () => {
    it('should delete product by id', async () => {
      // Arrange
      const created = await service.createProduct({
        handle: 'test',
        title: 'Test',
      });

      // Act
      await service.deleteProduct(created.id);

      // Assert
      await expect(service.getProduct(created.id)).rejects.toThrow('not found');
    });
  });

  /**
   * TEST 5: List Products
   */
  describe('listProducts', () => {
    it('should return all products', async () => {
      // Arrange
      await service.createProduct({ handle: 'p1', title: 'Product 1' });
      await service.createProduct({ handle: 'p2', title: 'Product 2' });

      // Act
      const products = await service.listProducts();

      // Assert
      expect(products).toHaveLength(2);
    });
  });
});
