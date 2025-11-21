import { ProductFactory } from './ProductFactory.js';

/**
 * Master Data Factory
 *
 * Central place for all data generation
 *
 * Usage:
 * ```typescript
 * // In tests
 * const product = DataFactory.product.create();
 * const products = DataFactory.product.createMany(10);
 *
 * // In seeds
 * await DataFactory.seedProducts(database, 50);
 * ```
 */
export class DataFactory {
  // Product factory
  static product = ProductFactory;

  // TODO: Add more factories
  // static order = OrderFactory;
  // static customer = CustomerFactory;
  // static inventory = InventoryFactory;

  /**
   * Seed products into database
   */
  static async seedProducts(
    database: any,
    count: number = 20
  ): Promise<void> {
    console.log(`🌱 Seeding ${count} products...`);

    const products = ProductFactory.createProducts(count, {
      status: 'active',
    });

    for (const product of products) {
      await database.execute(
        `INSERT INTO products (
          id, handle, title, description, status, vendor, product_type,
          metadata, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO NOTHING`,
        [
          product.id,
          product.handle,
          product.title,
          product.description,
          product.status,
          product.vendor,
          product.productType,
          JSON.stringify(product.metadata),
          product.createdAt,
          product.updatedAt,
        ]
      );

      // Create 2-4 variants per product
      const variantCount = Math.floor(Math.random() * 3) + 2;
      const variants = ProductFactory.createVariants(product.id, variantCount);

      for (const variant of variants) {
        await database.execute(
          `INSERT INTO variants (
            id, product_id, sku, barcode, title, price, compare_at_price,
            cost_per_item, taxable, weight_value, weight_unit,
            requires_shipping, metadata, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          ON CONFLICT (id) DO NOTHING`,
          [
            variant.id,
            variant.productId,
            variant.sku,
            variant.barcode,
            variant.title,
            variant.price,
            variant.compareAtPrice,
            variant.costPerItem,
            variant.taxable,
            variant.weight?.value,
            variant.weight?.unit,
            variant.requiresShipping,
            JSON.stringify(variant.metadata),
            variant.createdAt,
            variant.updatedAt,
          ]
        );
      }
    }

    console.log(`✅ Seeded ${count} products with variants`);
  }
}
