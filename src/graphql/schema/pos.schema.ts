/**
 * GraphQL Schema: POS
 *
 * Defines types, queries, and mutations for Point of Sale operations
 */
export const posTypeDefs = /* GraphQL */ `
  # POS Session Status Enum
  enum POSSessionStatus {
    open
    closed
  }

  # POS Session Type
  type POSSession {
    id: ID!
    sessionNumber: String!
    locationId: ID!
    cashierId: ID!
    status: POSSessionStatus!
    openingCash: Float!
    closingCash: Float
    expectedCash: Float
    totalSales: Float!
    totalTransactions: Int!
    openedAt: String!
    closedAt: String
  }

  # POS Sale Item Type
  type POSSaleItem {
    id: ID!
    saleId: ID!
    productId: ID!
    variantId: ID!
    quantity: Int!
    price: Float!
    discount: Float!
    total: Float!
    sku: String!
    title: String!
  }

  # POS Payment Type
  type POSPayment {
    id: ID!
    method: String!
    amount: Float!
    reference: String
  }

  # POS Sale Type
  type POSSale {
    id: ID!
    saleNumber: String!
    sessionId: ID!
    customerId: ID
    items: [POSSaleItem!]!
    subtotal: Float!
    tax: Float!
    discount: Float!
    total: Float!
    payments: [POSPayment!]!
    status: String!
    createdAt: String!
  }

  # Input Types
  input OpenSessionInput {
    locationId: ID!
    cashierId: ID!
    openingCash: Float!
  }

  input CloseSessionInput {
    closingCash: Float!
  }

  input POSSaleItemInput {
    productId: ID!
    variantId: ID!
    quantity: Int!
    price: Float!
    discount: Float
  }

  input POSPaymentInput {
    method: String!
    amount: Float!
    reference: String
  }

  input CreatePOSSaleInput {
    sessionId: ID!
    customerId: ID
    items: [POSSaleItemInput!]!
    payments: [POSPaymentInput!]!
  }

  # Queries
  extend type Query {
    posSessions(status: POSSessionStatus, limit: Int): [POSSession!]!
    posSession(id: ID!): POSSession
    posSales(sessionId: ID!, limit: Int): [POSSale!]!
    posSale(id: ID!): POSSale
  }

  # Mutations
  extend type Mutation {
    openPOSSession(input: OpenSessionInput!): POSSession!
    closePOSSession(id: ID!, input: CloseSessionInput!): POSSession!
    createPOSSale(input: CreatePOSSaleInput!): POSSale!
  }
`;
