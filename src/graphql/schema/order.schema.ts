/**
 * GraphQL Schema: Orders
 *
 * Defines types, queries, and mutations for orders
 */
export const orderTypeDefs = /* GraphQL */ `
  # Order Status Enum
  enum OrderStatus {
    pending
    confirmed
    processing
    shipped
    delivered
    cancelled
  }

  # Payment Status Enum
  enum PaymentStatus {
    pending
    paid
    partially_paid
    refunded
    voided
  }

  # Fulfillment Status Enum
  enum FulfillmentStatus {
    unfulfilled
    partially_fulfilled
    fulfilled
    cancelled
  }

  # Address Type
  type Address {
    firstName: String!
    lastName: String!
    company: String
    address1: String!
    address2: String
    city: String!
    region: String!
    postalCode: String!
    country: String!
    phone: String
  }

  # Order Item Type
  type OrderItem {
    id: ID!
    orderId: ID!
    productId: ID!
    variantId: ID!
    quantity: Int!
    price: Float!
    total: Float!
    sku: String!
    title: String!
    variantTitle: String
  }

  # Order Type
  type Order {
    id: ID!
    orderNumber: String!
    status: OrderStatus!
    financialStatus: PaymentStatus!
    fulfillmentStatus: FulfillmentStatus!
    customerId: ID
    items: [OrderItem!]!
    subtotal: Float!
    tax: Float!
    shipping: Float!
    discount: Float!
    total: Float!
    currency: String!
    shippingAddress: Address!
    billingAddress: Address!
    paymentMethod: String!
    shippingMethod: String!
    notes: String
    createdAt: String!
    updatedAt: String!
  }

  # Input Types
  input AddressInput {
    firstName: String!
    lastName: String!
    company: String
    address1: String!
    address2: String
    city: String!
    region: String!
    postalCode: String!
    country: String!
    phone: String
  }

  input OrderItemInput {
    productId: ID!
    variantId: ID!
    quantity: Int!
    price: Float!
  }

  input CreateOrderInput {
    customerId: ID
    items: [OrderItemInput!]!
    shippingAddress: AddressInput!
    billingAddress: AddressInput!
    paymentMethod: String!
    shippingMethod: String!
    notes: String
  }

  input UpdateOrderInput {
    status: OrderStatus
    financialStatus: PaymentStatus
    fulfillmentStatus: FulfillmentStatus
    notes: String
  }

  # Queries
  extend type Query {
    orders(
      limit: Int
      status: OrderStatus
      customerId: ID
    ): [Order!]!
    order(id: ID!): Order
  }

  # Mutations
  extend type Mutation {
    createOrder(input: CreateOrderInput!): Order!
    updateOrder(id: ID!, input: UpdateOrderInput!): Order!
    cancelOrder(id: ID!): Order!
  }
`;
