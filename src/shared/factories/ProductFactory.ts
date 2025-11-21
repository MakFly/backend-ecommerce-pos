import { faker } from '@faker-js/faker';
import { Product, Variant, CreateProductDto } from '@modules/products/models/Product.js';

/**
 * Data Factory for Products
 *
 * SOLID Principles:
 * - Single Responsibility: Generate fake data only
 * - Open/Closed: Easy to extend with new methods
 *
 * Usage:
 * - Tests: Create fake products for testing
 * - Seeding: Populate database with sample data
 */
export class ProductFactory {
  /**
   * Generate a fake product
   */
  static createProduct(overrides?: Partial<Product>): Product {
    return {
      id: faker.string.nanoid(),
      handle: faker.helpers.slugify(faker.commerce.productName()).toLowerCase(),
      title: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      status: faker.helpers.arrayElement(['draft', 'active', 'archived'] as const),
      vendor: faker.company.name(),
      productType: faker.commerce.department(),
      metadata: {},
      createdAt: faker.date.past(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  /**
   * Generate a fake variant
   */
  static createVariant(productId: string, overrides?: Partial<Variant>): Variant {
    return {
      id: faker.string.nanoid(),
      productId,
      sku: faker.string.alphanumeric(10).toUpperCase(),
      barcode: faker.string.numeric(13),
      title: faker.commerce.productName(),
      price: parseFloat(faker.commerce.price()),
      compareAtPrice: parseFloat(faker.commerce.price({ min: 100, max: 200 })),
      costPerItem: parseFloat(faker.commerce.price({ min: 10, max: 50 })),
      taxable: faker.datatype.boolean(),
      weight: {
        value: faker.number.int({ min: 100, max: 5000 }),
        unit: faker.helpers.arrayElement(['g', 'kg', 'lb']),
      },
      requiresShipping: faker.datatype.boolean(),
      metadata: {},
      createdAt: faker.date.past(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  /**
   * Generate a CreateProductDto for testing
   */
  static createProductDto(overrides?: Partial<CreateProductDto>): CreateProductDto {
    return {
      handle: faker.helpers.slugify(faker.commerce.productName()).toLowerCase(),
      title: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      vendor: faker.company.name(),
      productType: faker.commerce.department(),
      status: 'draft',
      ...overrides,
    };
  }

  /**
   * Generate multiple products
   */
  static createProducts(count: number, overrides?: Partial<Product>): Product[] {
    return Array.from({ length: count }, () => this.createProduct(overrides));
  }

  /**
   * Generate multiple variants for a product
   */
  static createVariants(productId: string, count: number): Variant[] {
    return Array.from({ length: count }, () => this.createVariant(productId));
  }

  /**
   * Generate a complete product with variants
   */
  static createProductWithVariants(variantCount: number = 3): {
    product: Product;
    variants: Variant[];
  } {
    const product = this.createProduct({ status: 'active' });
    const variants = this.createVariants(product.id, variantCount);

    return { product, variants };
  }
}
