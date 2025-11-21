import { GraphQLContext } from '../index.js';

/**
 * GraphQL Resolvers: Inventory
 *
 * SOLID Principles:
 * - Dependency Injection: InventoryService injected via context
 * - Single Responsibility: Handle GraphQL resolution only
 */
export const inventoryResolvers = {
  Query: {
    /**
     * Get all warehouses
     */
    warehouses: async (
      _parent: any,
      args: { isActive?: boolean },
      context: GraphQLContext
    ) => {
      return await context.inventoryService.listWarehouses(args);
    },

    /**
     * Get a single warehouse
     */
    warehouse: async (_parent: any, args: { id: string }, context: GraphQLContext) => {
      return await context.inventoryService.getWarehouse(args.id);
    },

    /**
     * Get stock level for a variant in a warehouse
     */
    stockLevel: async (
      _parent: any,
      args: { variantId: string; warehouseId: string },
      context: GraphQLContext
    ) => {
      return await context.inventoryService.getStockLevel(args.variantId, args.warehouseId);
    },

    /**
     * Get all stock levels for a variant
     */
    stockLevels: async (
      _parent: any,
      args: { variantId?: string },
      context: GraphQLContext
    ) => {
      return await context.inventoryService.listStockLevels(args);
    },

    /**
     * Get stock movements for a variant
     */
    stockMovements: async (
      _parent: any,
      args: { variantId: string; limit?: number },
      context: GraphQLContext
    ) => {
      return await context.inventoryService.getStockMovements(args.variantId, args.limit);
    },
  },

  Mutation: {
    /**
     * Reserve stock
     */
    reserveStock: async (_parent: any, args: { input: any }, context: GraphQLContext) => {
      return await context.inventoryService.reserveStock(args.input);
    },

    /**
     * Release reserved stock
     */
    releaseStock: async (_parent: any, args: { input: any }, context: GraphQLContext) => {
      return await context.inventoryService.releaseStock(args.input);
    },

    /**
     * Adjust stock level
     */
    adjustStock: async (_parent: any, args: { input: any }, context: GraphQLContext) => {
      return await context.inventoryService.adjustStock(args.input);
    },
  },
};
