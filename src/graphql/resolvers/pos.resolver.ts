import { GraphQLContext } from '../index.js';

/**
 * GraphQL Resolvers: POS
 *
 * SOLID Principles:
 * - Dependency Injection: POSService injected via context
 * - Single Responsibility: Handle GraphQL resolution only
 */
export const posResolvers = {
  Query: {
    /**
     * Get all POS sessions
     */
    posSessions: async (
      _parent: any,
      args: { status?: string; limit?: number },
      context: GraphQLContext
    ) => {
      return await context.posService.listSessions(args);
    },

    /**
     * Get a single POS session
     */
    posSession: async (_parent: any, args: { id: string }, context: GraphQLContext) => {
      return await context.posService.getSession(args.id);
    },

    /**
     * Get all sales for a session
     */
    posSales: async (
      _parent: any,
      args: { sessionId: string; limit?: number },
      context: GraphQLContext
    ) => {
      return await context.posService.listSales(args);
    },

    /**
     * Get a single POS sale
     */
    posSale: async (_parent: any, args: { id: string }, context: GraphQLContext) => {
      return await context.posService.getSale(args.id);
    },
  },

  Mutation: {
    /**
     * Open a new POS session
     */
    openPOSSession: async (_parent: any, args: { input: any }, context: GraphQLContext) => {
      return await context.posService.openSession(args.input);
    },

    /**
     * Close a POS session
     */
    closePOSSession: async (
      _parent: any,
      args: { id: string; input: any },
      context: GraphQLContext
    ) => {
      return await context.posService.closeSession(args.id, args.input);
    },

    /**
     * Create a new POS sale
     */
    createPOSSale: async (_parent: any, args: { input: any }, context: GraphQLContext) => {
      return await context.posService.createSale(args.input);
    },
  },
};
