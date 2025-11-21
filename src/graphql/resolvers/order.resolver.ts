import { GraphQLContext } from '../index.js';

/**
 * GraphQL Resolvers: Orders
 *
 * SOLID Principles:
 * - Dependency Injection: OrderService injected via context
 * - Single Responsibility: Handle GraphQL resolution only
 */
export const orderResolvers = {
  Query: {
    /**
     * Get all orders
     */
    orders: async (
      _parent: any,
      args: { limit?: number; status?: string; customerId?: string },
      context: GraphQLContext
    ) => {
      return await context.orderService.listOrders(args);
    },

    /**
     * Get a single order by ID
     */
    order: async (_parent: any, args: { id: string }, context: GraphQLContext) => {
      return await context.orderService.findById(args.id);
    },
  },

  Mutation: {
    /**
     * Create a new order
     */
    createOrder: async (_parent: any, args: { input: any }, context: GraphQLContext) => {
      return await context.orderService.createOrder(args.input);
    },

    /**
     * Update an order
     */
    updateOrder: async (
      _parent: any,
      args: { id: string; input: any },
      context: GraphQLContext
    ) => {
      return await context.orderService.updateOrder(args.id, args.input);
    },

    /**
     * Cancel an order
     */
    cancelOrder: async (_parent: any, args: { id: string }, context: GraphQLContext) => {
      return await context.orderService.cancelOrder(args.id);
    },
  },

  Order: {
    // Field resolvers can be added here if needed
    // For example, to fetch related data like customer details
  },
};
