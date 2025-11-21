/**
 * GraphQL Schema: Promotions
 *
 * Defines types, queries, and mutations for promotions and discounts
 */
export const promotionTypeDefs = /* GraphQL */ `
  # Discount Type Enum
  enum DiscountType {
    percentage
    fixed
    buy_x_get_y
    free_shipping
  }

  # Coupon Type
  type Coupon {
    id: ID!
    code: String!
    type: DiscountType!
    value: Float!
    minPurchaseAmount: Float
    maxDiscountAmount: Float
    usageLimit: Int
    timesUsed: Int!
    startsAt: String
    endsAt: String
    isActive: Boolean!
    createdAt: String!
  }

  # Discount Type
  type Discount {
    id: ID!
    title: String!
    type: DiscountType!
    value: Float!
    target: String!
    targetSelection: String!
    productIds: [ID!]
    collectionIds: [ID!]
    minPurchaseAmount: Float
    startsAt: String
    endsAt: String
    isActive: Boolean!
    priority: Int!
  }

  # Coupon Validation Result
  type CouponValidation {
    valid: Boolean!
    coupon: Coupon
    discountAmount: Float
    error: String
  }

  # Discount Result
  type DiscountResult {
    total: Float!
    discounts: [AppliedDiscount!]!
  }

  type AppliedDiscount {
    name: String!
    amount: Float!
    type: String!
  }

  # Input Types
  input ValidateCouponInput {
    code: String!
    orderTotal: Float!
  }

  input ApplyDiscountsInput {
    orderTotal: Float!
    items: [DiscountItemInput!]!
    couponCode: String
  }

  input DiscountItemInput {
    productId: ID!
    quantity: Int!
    price: Float!
  }

  input CreateCouponInput {
    code: String!
    type: DiscountType!
    value: Float!
    minPurchaseAmount: Float
    maxDiscountAmount: Float
    usageLimit: Int
    startsAt: String
    endsAt: String
  }

  # Queries
  extend type Query {
    coupons(isActive: Boolean, limit: Int): [Coupon!]!
    coupon(code: String!): Coupon
    validateCoupon(input: ValidateCouponInput!): CouponValidation!
    discounts(isActive: Boolean, limit: Int): [Discount!]!
  }

  # Mutations
  extend type Mutation {
    createCoupon(input: CreateCouponInput!): Coupon!
    applyDiscounts(input: ApplyDiscountsInput!): DiscountResult!
  }
`;
