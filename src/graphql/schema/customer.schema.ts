/**
 * GraphQL Schema: Customers
 *
 * Defines types, queries, and mutations for customers
 */
export const customerTypeDefs = /* GraphQL */ `
  # Customer Status Enum
  enum CustomerStatus {
    active
    disabled
    invited
  }

  # Customer Address Type
  type CustomerAddress {
    id: ID!
    customerId: ID!
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
    isDefault: Boolean!
  }

  # Customer Type
  type Customer {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    phone: String
    status: CustomerStatus!
    emailVerified: Boolean!
    addresses: [CustomerAddress!]!
    tags: [String!]!
    totalSpent: Float!
    ordersCount: Int!
    lastOrderAt: String
    createdAt: String!
    updatedAt: String!
  }

  # Input Types
  input CustomerAddressInput {
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
    isDefault: Boolean
  }

  input CreateCustomerInput {
    email: String!
    firstName: String!
    lastName: String!
    phone: String
    tags: [String!]
  }

  input UpdateCustomerInput {
    email: String
    firstName: String
    lastName: String
    phone: String
    status: CustomerStatus
    tags: [String!]
  }

  # Queries
  extend type Query {
    customers(
      limit: Int
      status: CustomerStatus
      search: String
    ): [Customer!]!
    customer(id: ID!): Customer
  }

  # Mutations
  extend type Mutation {
    createCustomer(input: CreateCustomerInput!): Customer!
    updateCustomer(id: ID!, input: UpdateCustomerInput!): Customer!
    addCustomerAddress(customerId: ID!, input: CustomerAddressInput!): CustomerAddress!
  }
`;
