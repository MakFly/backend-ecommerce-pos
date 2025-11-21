import { productResolvers } from './product.resolver.js';
import { orderResolvers } from './order.resolver.js';
import { customerResolvers } from './customer.resolver.js';
import { inventoryResolvers } from './inventory.resolver.js';
import { posResolvers } from './pos.resolver.js';
import { promotionResolvers } from './promotion.resolver.js';

/**
 * Root Resolvers
 *
 * Combines all resolvers from all modules
 */
export const resolvers = {
  Query: {
    // Products
    ...productResolvers.Query,
    // Orders
    ...orderResolvers.Query,
    // Customers
    ...customerResolvers.Query,
    // Inventory
    ...inventoryResolvers.Query,
    // POS
    ...posResolvers.Query,
    // Promotions
    ...promotionResolvers.Query,
  },
  Mutation: {
    // Products
    ...productResolvers.Mutation,
    // Orders
    ...orderResolvers.Mutation,
    // Customers
    ...customerResolvers.Mutation,
    // Inventory
    ...inventoryResolvers.Mutation,
    // POS
    ...posResolvers.Mutation,
    // Promotions
    ...promotionResolvers.Mutation,
  },
  // Type resolvers
  Product: {
    ...productResolvers.Product,
  },
  Order: {
    ...orderResolvers.Order,
  },
  Customer: {
    ...customerResolvers.Customer,
  },
};
