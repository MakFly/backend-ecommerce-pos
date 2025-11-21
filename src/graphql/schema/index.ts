import { productTypeDefs } from './product.schema.js';
import { orderTypeDefs } from './order.schema.js';
import { customerTypeDefs } from './customer.schema.js';
import { inventoryTypeDefs } from './inventory.schema.js';
import { posTypeDefs } from './pos.schema.js';
import { promotionTypeDefs } from './promotion.schema.js';

/**
 * Root GraphQL Schema
 *
 * Combines all type definitions
 */
export const typeDefs = /* GraphQL */ `
  # Base Query and Mutation types
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }

  # Module Schemas
  ${productTypeDefs}
  ${orderTypeDefs}
  ${customerTypeDefs}
  ${inventoryTypeDefs}
  ${posTypeDefs}
  ${promotionTypeDefs}
`;
