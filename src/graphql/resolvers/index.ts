import { productResolvers } from './product.resolver.js';

/**
 * Root Resolvers
 *
 * Combines all resolvers
 */
export const resolvers = {
  Query: {
    ...productResolvers.Query,
    // TODO: Add more queries
  },
  Mutation: {
    ...productResolvers.Mutation,
    // TODO: Add more mutations
  },
  Product: {
    ...productResolvers.Product,
  },
};
