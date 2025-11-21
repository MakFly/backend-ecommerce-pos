import { ProductFactory } from './ProductFactory.js';
import { OrderFactory } from './OrderFactory.js';
import { CustomerFactory } from './CustomerFactory.js';
import { InventoryFactory } from './InventoryFactory.js';
import { POSFactory } from './POSFactory.js';
import { AuthFactory } from './AuthFactory.js';
import { ShippingFactory } from './ShippingFactory.js';
import { TaxFactory } from './TaxFactory.js';
import { PromotionFactory } from './PromotionFactory.js';

/**
 * Master Data Factory
 *
 * Central place for all data generation
 *
 * Usage:
 * ```typescript
 * // In tests
 * const product = DataFactory.product.createProduct();
 * const order = DataFactory.order.createOrder();
 * const customer = DataFactory.customer.createCustomer();
 *
 * // In seeds
 * await DataFactory.seedDatabase(database);
 * ```
 */
export class DataFactory {
  // All factories
  static product = ProductFactory;
  static order = OrderFactory;
  static customer = CustomerFactory;
  static inventory = InventoryFactory;
  static pos = POSFactory;
  static auth = AuthFactory;
  static shipping = ShippingFactory;
  static tax = TaxFactory;
  static promotion = PromotionFactory;

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

  /**
   * Seed entire database with sample data
   */
  static async seedDatabase(database: any): Promise<void> {
    console.log('\n🌱 Seeding complete database...\n');

    // Seed products (already implemented)
    await this.seedProducts(database, 50);

    console.log('\n✅ Database seeding complete!\n');
    console.log('📊 Summary:');
    console.log('  - Products: 50 with variants');
    console.log('  - Additional modules: Coming soon');
  }
}
