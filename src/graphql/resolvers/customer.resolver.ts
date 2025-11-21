import { GraphQLContext } from '../index.js';

/**
 * GraphQL Resolvers: Customers
 *
 * SOLID Principles:
 * - Dependency Injection: CustomerService injected via context
 * - Single Responsibility: Handle GraphQL resolution only
 */
export const customerResolvers = {
  Query: {
    /**
     * Get all customers
     */
    customers: async (
      _parent: any,
      args: { limit?: number; status?: string; search?: string },
      context: GraphQLContext
    ) => {
      return await context.customerService.listCustomers(args);
    },

    /**
     * Get a single customer by ID
     */
    customer: async (_parent: any, args: { id: string }, context: GraphQLContext) => {
      return await context.customerService.findById(args.id);
    },
  },

  Mutation: {
    /**
     * Create a new customer
     */
    createCustomer: async (_parent: any, args: { input: any }, context: GraphQLContext) => {
      return await context.customerService.createCustomer(args.input);
    },

    /**
     * Update a customer
     */
    updateCustomer: async (
      _parent: any,
      args: { id: string; input: any },
      context: GraphQLContext
    ) => {
      return await context.customerService.updateCustomer(args.id, args.input);
    },

    /**
     * Add an address to a customer
     */
    addCustomerAddress: async (
      _parent: any,
      args: { customerId: string; input: any },
      context: GraphQLContext
    ) => {
      return await context.customerService.addAddress(args.customerId, args.input);
    },
  },

  Customer: {
    // Field resolvers can be added here if needed
  },
};
