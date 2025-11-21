import { IProductRepository } from './IProductRepository.js';
import { Product, Variant } from '../models/Product.js';
import { FindOptions } from '@shared/interfaces/IRepository.js';
import { IDatabase } from '@shared/interfaces/IDatabase.js';

/**
 * Product Repository Implementation (PostgreSQL)
 *
 * SOLID Principles:
 * - Single Responsibility Principle (SRP): Handles data access only
 * - Dependency Inversion Principle (DIP): Implements interface
 * - Open/Closed Principle (OCP): Can be extended without modification
 */
export class ProductRepository implements IProductRepository {
  constructor(private readonly db: IDatabase) {}

  async findById(id: string): Promise<Product | null> {
    const rows = await this.db.query<Product>(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );

    return rows[0] || null;
  }

  async findByHandle(handle: string): Promise<Product | null> {
    const rows = await this.db.query<Product>(
      'SELECT * FROM products WHERE handle = $1',
      [handle]
    );

    return rows[0] || null;
  }

  async findBySku(sku: string): Promise<Variant | null> {
    const rows = await this.db.query<Variant>(
      'SELECT * FROM variants WHERE sku = $1',
      [sku]
    );

    return rows[0] || null;
  }

  async findAll(options?: FindOptions): Promise<Product[]> {
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;
    const orderBy = options?.orderBy || 'created_at';
    const order = options?.order || 'desc';

    const rows = await this.db.query<Product>(
      `SELECT * FROM products
       ORDER BY ${orderBy} ${order}
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return rows;
  }

  async findBy(criteria: Record<string, unknown>): Promise<Product[]> {
    const keys = Object.keys(criteria);
    const values = Object.values(criteria);

    if (keys.length === 0) {
      return this.findAll();
    }

    const conditions = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');

    const rows = await this.db.query<Product>(
      `SELECT * FROM products WHERE ${conditions}`,
      values
    );

    return rows;
  }

  async count(criteria?: Record<string, unknown>): Promise<number> {
    if (!criteria || Object.keys(criteria).length === 0) {
      const rows = await this.db.query<{ count: string }>(
        'SELECT COUNT(*) as count FROM products'
      );
      return parseInt(rows[0].count, 10);
    }

    const keys = Object.keys(criteria);
    const values = Object.values(criteria);
    const conditions = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');

    const rows = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM products WHERE ${conditions}`,
      values
    );

    return parseInt(rows[0].count, 10);
  }

  async save(product: Product): Promise<void> {
    await this.db.execute(
      `INSERT INTO products (
        id, handle, title, description, status, vendor, product_type,
        metadata, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        product.id,
        product.handle,
        product.title,
        product.description || null,
        product.status,
        product.vendor || null,
        product.productType || null,
        JSON.stringify(product.metadata || {}),
        product.createdAt,
        product.updatedAt,
      ]
    );
  }

  async update(id: string, product: Partial<Product>): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    Object.entries(product).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'createdAt') {
        const dbKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
        fields.push(`${dbKey} = $${paramIndex++}`);
        values.push(value);
      }
    });

    fields.push(`updated_at = $${paramIndex++}`);
    values.push(new Date());
    values.push(id);

    await this.db.execute(
      `UPDATE products SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
      values
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.execute('DELETE FROM products WHERE id = $1', [id]);
  }

  async getVariants(productId: string): Promise<Variant[]> {
    const rows = await this.db.query<Variant>(
      'SELECT * FROM variants WHERE product_id = $1',
      [productId]
    );

    return rows;
  }

  async saveVariant(variant: Variant): Promise<void> {
    await this.db.execute(
      `INSERT INTO variants (
        id, product_id, sku, barcode, title, price, compare_at_price,
        cost_per_item, taxable, weight_value, weight_unit,
        requires_shipping, metadata, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        variant.id,
        variant.productId,
        variant.sku,
        variant.barcode || null,
        variant.title,
        variant.price,
        variant.compareAtPrice || null,
        variant.costPerItem || null,
        variant.taxable,
        variant.weight?.value || null,
        variant.weight?.unit || null,
        variant.requiresShipping,
        JSON.stringify(variant.metadata || {}),
        variant.createdAt,
        variant.updatedAt,
      ]
    );
  }
}
