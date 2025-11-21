import { productTypeDefs } from './product.schema.js';

/**
 * Root GraphQL Schema
 *
 * Combines all type definitions
 */
export const typeDefs = /* GraphQL */ `
  ${productTypeDefs}

  # TODO: Add more schemas
  # ${orderTypeDefs}
  # ${customerTypeDefs}
`;
