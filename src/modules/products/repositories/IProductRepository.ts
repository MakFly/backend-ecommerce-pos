import { IQueryableRepository } from '@shared/interfaces/IRepository.js';
import { Product, Variant } from '../models/Product.js';

/**
 * Product Repository Interface
 *
 * SOLID Principles:
 * - Dependency Inversion Principle (DIP): Service depends on this interface
 * - Interface Segregation Principle (ISP): Product-specific operations only
 */
export interface IProductRepository extends IQueryableRepository<Product> {
  findByHandle(handle: string): Promise<Product | null>;
  findBySku(sku: string): Promise<Variant | null>;
  getVariants(productId: string): Promise<Variant[]>;
  saveVariant(variant: Variant): Promise<void>;
}
