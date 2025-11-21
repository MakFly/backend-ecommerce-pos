import { describe, it, expect } from 'vitest';
import { Product } from '@modules/products/domain/Product.js';

describe('Product', () => {
  it('should create a new product', () => {
    const product = Product.create({
      handle: 'test-product',
      title: 'Test Product',
      description: 'A test product',
      status: 'draft',
      vendor: 'Test Vendor',
    });

    expect(product.id).toBeDefined();
    expect(product.handle).toBe('test-product');
    expect(product.title).toBe('Test Product');
    expect(product.status).toBe('draft');
  });

  it('should update product properties', () => {
    const product = Product.create({
      handle: 'test-product',
      title: 'Test Product',
      status: 'draft',
    });

    product.update({ title: 'Updated Product' });

    expect(product.title).toBe('Updated Product');
  });

  it('should activate product', () => {
    const product = Product.create({
      handle: 'test-product',
      title: 'Test Product',
      status: 'draft',
    });

    product.activate();

    expect(product.status).toBe('active');
  });
});
