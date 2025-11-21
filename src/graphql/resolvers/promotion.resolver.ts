import { GraphQLContext } from '../index.js';

/**
 * GraphQL Resolvers: Promotions
 *
 * SOLID Principles:
 * - Dependency Injection: PromotionService injected via context
 * - Single Responsibility: Handle GraphQL resolution only
 */
export const promotionResolvers = {
  Query: {
    /**
     * Get all coupons
     */
    coupons: async (
      _parent: any,
      args: { isActive?: boolean; limit?: number },
      context: GraphQLContext
    ) => {
      return await context.promotionService.listCoupons(args);
    },

    /**
     * Get a coupon by code
     */
    coupon: async (_parent: any, args: { code: string }, context: GraphQLContext) => {
      return await context.promotionService.getCoupon(args.code);
    },

    /**
     * Validate a coupon
     */
    validateCoupon: async (_parent: any, args: { input: any }, context: GraphQLContext) => {
      return await context.promotionService.validateCoupon(args.input);
    },

    /**
     * Get all discounts
     */
    discounts: async (
      _parent: any,
      args: { isActive?: boolean; limit?: number },
      context: GraphQLContext
    ) => {
      return await context.promotionService.listDiscounts(args);
    },
  },

  Mutation: {
    /**
     * Create a new coupon
     */
    createCoupon: async (_parent: any, args: { input: any }, context: GraphQLContext) => {
      return await context.promotionService.createCoupon(args.input);
    },

    /**
     * Apply discounts to an order
     */
    applyDiscounts: async (_parent: any, args: { input: any }, context: GraphQLContext) => {
      return await context.promotionService.applyDiscounts(args.input);
    },
  },
};
