import { QueryableRepository } from '@core/domain/Repository.js';
import { Product } from '../domain/Product.js';
import { Variant } from '../domain/Variant.js';
import { Money } from '../domain/Money.js';
import { getDatabase } from '@core/infrastructure/database.js';

export class ProductRepository implements QueryableRepository<Product> {
  async findById(id: string): Promise<Product | null> {
    const db = getDatabase();

    const [productRow] = await db`
      SELECT * FROM products WHERE id = ${id}
    `;

    if (!productRow) return null;

    const variants = await db`
      SELECT * FROM variants WHERE product_id = ${id}
    `;

    const images = await db`
      SELECT * FROM product_images WHERE product_id = ${id} ORDER BY position
    `;

    return Product.reconstitute(
      {
        handle: productRow.handle,
        title: productRow.title,
        description: productRow.description,
        status: productRow.status,
        vendor: productRow.vendor,
        productType: productRow.product_type,
        metadata: productRow.metadata,
        variants: variants.map((v) =>
          Variant.reconstitute(
            {
              productId: v.product_id,
              sku: v.sku,
              barcode: v.barcode,
              title: v.title,
              price: Money.create(parseFloat(v.price), 'USD'),
              compareAtPrice: v.compare_at_price
                ? Money.create(parseFloat(v.compare_at_price), 'USD')
                : undefined,
              costPerItem: v.cost_per_item
                ? Money.create(parseFloat(v.cost_per_item), 'USD')
                : undefined,
              taxable: v.taxable,
              weight: v.weight_value
                ? { value: v.weight_value, unit: v.weight_unit }
                : undefined,
              requiresShipping: v.requires_shipping,
              metadata: v.metadata,
            },
            v.id
          )
        ),
        images: images.map((img) => ({
          id: img.id,
          url: img.url,
          altText: img.alt_text,
          position: img.position,
        })),
      },
      productRow.id
    );
  }

  async findAll(options?: { limit?: number; offset?: number }): Promise<Product[]> {
    const db = getDatabase();
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;

    const products = await db`
      SELECT * FROM products
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    return Promise.all(products.map((p) => this.findById(p.id) as Promise<Product>));
  }

  async findMany(criteria: { status?: string }): Promise<Product[]> {
    const db = getDatabase();

    let query = db`SELECT * FROM products WHERE 1=1`;

    if (criteria.status) {
      query = db`SELECT * FROM products WHERE status = ${criteria.status}`;
    }

    const products = await query;
    return Promise.all(products.map((p) => this.findById(p.id) as Promise<Product>));
  }

  async count(criteria?: { status?: string }): Promise<number> {
    const db = getDatabase();

    let query;
    if (criteria?.status) {
      query = await db`SELECT COUNT(*) as count FROM products WHERE status = ${criteria.status}`;
    } else {
      query = await db`SELECT COUNT(*) as count FROM products`;
    }

    return parseInt(query[0].count);
  }

  async save(product: Product): Promise<void> {
    const db = getDatabase();

    await db`
      INSERT INTO products (
        id, handle, title, description, status, vendor, product_type, metadata, created_at, updated_at
      ) VALUES (
        ${product.id}, ${product.handle}, ${product.title}, ${product.description || null},
        ${product.status}, ${product.vendor || null}, ${product.productType || null},
        ${JSON.stringify(product.metadata || {})}, ${product.createdAt}, ${product.updatedAt}
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        status = EXCLUDED.status,
        vendor = EXCLUDED.vendor,
        product_type = EXCLUDED.product_type,
        metadata = EXCLUDED.metadata,
        updated_at = EXCLUDED.updated_at
    `;

    // Save variants
    for (const variant of product.variants) {
      await db`
        INSERT INTO variants (
          id, product_id, sku, barcode, title, price, compare_at_price, cost_per_item,
          taxable, weight_value, weight_unit, requires_shipping, metadata, created_at, updated_at
        ) VALUES (
          ${variant.id}, ${product.id}, ${variant.sku}, ${variant.barcode || null},
          ${variant.title}, ${variant.price.amount}, ${variant.compareAtPrice?.amount || null},
          ${variant.costPerItem?.amount || null}, ${variant.taxable},
          ${variant.weight?.value || null}, ${variant.weight?.unit || null},
          ${variant.requiresShipping}, ${JSON.stringify(variant.metadata || {})},
          ${variant.createdAt}, ${variant.updatedAt}
        )
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          price = EXCLUDED.price,
          updated_at = EXCLUDED.updated_at
      `;
    }

    // Save images
    for (const image of product.images) {
      await db`
        INSERT INTO product_images (id, product_id, url, alt_text, position, created_at)
        VALUES (
          ${image.id}, ${product.id}, ${image.url}, ${image.altText || null}, ${image.position}, NOW()
        )
        ON CONFLICT (id) DO NOTHING
      `;
    }
  }

  async delete(id: string): Promise<void> {
    const db = getDatabase();
    await db`DELETE FROM products WHERE id = ${id}`;
  }

  async findByHandle(handle: string): Promise<Product | null> {
    const db = getDatabase();
    const [productRow] = await db`SELECT id FROM products WHERE handle = ${handle}`;
    if (!productRow) return null;
    return this.findById(productRow.id);
  }
}
