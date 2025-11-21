/**
 * GraphQL Schema: Inventory
 *
 * Defines types, queries, and mutations for inventory management
 */
export const inventoryTypeDefs = /* GraphQL */ `
  # Warehouse Type
  type Warehouse {
    id: ID!
    code: String!
    name: String!
    isActive: Boolean!
    createdAt: String!
  }

  # Stock Level Type
  type StockLevel {
    id: ID!
    variantId: ID!
    warehouseId: ID!
    available: Int!
    reserved: Int!
    incoming: Int!
    onHand: Int!
  }

  # Stock Movement Type
  type StockMovement {
    id: ID!
    variantId: ID!
    warehouseId: ID!
    type: String!
    quantity: Int!
    reason: String
    reference: String
    createdAt: String!
  }

  # Input Types
  input ReserveStockInput {
    variantId: ID!
    warehouseId: ID!
    quantity: Int!
    reference: String
  }

  input AdjustStockInput {
    variantId: ID!
    warehouseId: ID!
    quantity: Int!
    reason: String!
  }

  # Queries
  extend type Query {
    warehouses(isActive: Boolean): [Warehouse!]!
    warehouse(id: ID!): Warehouse
    stockLevel(variantId: ID!, warehouseId: ID!): StockLevel
    stockLevels(variantId: ID): [StockLevel!]!
    stockMovements(variantId: ID!, limit: Int): [StockMovement!]!
  }

  # Mutations
  extend type Mutation {
    reserveStock(input: ReserveStockInput!): StockLevel!
    releaseStock(input: ReserveStockInput!): StockLevel!
    adjustStock(input: AdjustStockInput!): StockLevel!
  }
`;
