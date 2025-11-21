import { ProductService } from '@modules/products/services/ProductService.js';
import { CreateProductDto, UpdateProductDto } from '@modules/products/models/Product.js';

/**
 * GraphQL Resolvers for Products
 *
 * SOLID Principles:
 * - Single Responsibility: Resolvers only map GraphQL to service calls
 * - Dependency Injection: Receives services via context
 */

export const productResolvers = {
  // ===================================
  // Queries
  // ===================================
  Query: {
    /**
     * Get all products
     */
    products: async (
      _parent: unknown,
      args: { limit?: number; offset?: number; status?: string },
      context: { productService: ProductService }
    ) => {
      const products = await context.productService.listProducts({
        limit: args.limit,
        offset: args.offset,
        filters: args.status ? { status: args.status.toLowerCase() } : undefined,
      });

      return products.map((p) => ({
        ...p,
        status: p.status.toUpperCase(),
      }));
    },

    /**
     * Get a single product by ID
     */
    product: async (
      _parent: unknown,
      args: { id: string },
      context: { productService: ProductService }
    ) => {
      try {
        const product = await context.productService.getProduct(args.id);
        return {
          ...product,
          status: product.status.toUpperCase(),
          variants: [], // TODO: Load variants
        };
      } catch (error) {
        return null;
      }
    },

    /**
     * Get a product by handle
     */
    productByHandle: async (
      _parent: unknown,
      args: { handle: string },
      context: { productService: ProductService }
    ) => {
      // TODO: Implement findByHandle in service
      return null;
    },

    /**
     * Search products by title
     */
    searchProducts: async (
      _parent: unknown,
      args: { query: string },
      context: { productService: ProductService }
    ) => {
      // TODO: Implement search in service
      return [];
    },
  },

  // ===================================
  // Mutations
  // ===================================
  Mutation: {
    /**
     * Create a new product
     */
    createProduct: async (
      _parent: unknown,
      args: { input: CreateProductDto & { status?: string } },
      context: { productService: ProductService }
    ) => {
      const dto: CreateProductDto = {
        handle: args.input.handle,
        title: args.input.title,
        description: args.input.description,
        vendor: args.input.vendor,
        productType: args.input.productType,
        status: args.input.status?.toLowerCase() as any,
      };

      const product = await context.productService.createProduct(dto);

      return {
        ...product,
        status: product.status.toUpperCase(),
        variants: [],
      };
    },

    /**
     * Update an existing product
     */
    updateProduct: async (
      _parent: unknown,
      args: { id: string; input: UpdateProductDto & { status?: string } },
      context: { productService: ProductService }
    ) => {
      const dto: UpdateProductDto = {
        title: args.input.title,
        description: args.input.description,
        vendor: args.input.vendor,
        productType: args.input.productType,
        status: args.input.status?.toLowerCase() as any,
      };

      const product = await context.productService.updateProduct(args.id, dto);

      return {
        ...product,
        status: product.status.toUpperCase(),
        variants: [],
      };
    },

    /**
     * Delete a product
     */
    deleteProduct: async (
      _parent: unknown,
      args: { id: string },
      context: { productService: ProductService }
    ) => {
      try {
        await context.productService.deleteProduct(args.id);
        return true;
      } catch (error) {
        return false;
      }
    },

    /**
     * Add a variant to a product
     */
    addVariant: async (
      _parent: unknown,
      args: { productId: string; input: any },
      context: { productService: ProductService }
    ) => {
      // TODO: Implement addVariant in service
      throw new Error('Not implemented');
    },
  },

  // ===================================
  // Field Resolvers
  // ===================================
  Product: {
    /**
     * Resolve variants for a product
     */
    variants: async (parent: any, _args: unknown, _context: any) => {
      // TODO: Load variants from repository
      return [];
    },
  },
};
