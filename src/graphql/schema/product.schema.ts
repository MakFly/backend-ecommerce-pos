/**
 * GraphQL Schema for Products
 *
 * Defines types, queries, and mutations for products
 */
export const productTypeDefs = /* GraphQL */ `
  # ===================================
  # Types
  # ===================================

  """
  Product status enum
  """
  enum ProductStatus {
    DRAFT
    ACTIVE
    ARCHIVED
  }

  """
  Product type
  """
  type Product {
    id: ID!
    handle: String!
    title: String!
    description: String
    status: ProductStatus!
    vendor: String
    productType: String
    variants: [Variant!]!
    createdAt: String!
    updatedAt: String!
  }

  """
  Product variant type
  """
  type Variant {
    id: ID!
    productId: ID!
    sku: String!
    barcode: String
    title: String!
    price: Float!
    compareAtPrice: Float
    costPerItem: Float
    taxable: Boolean!
    weight: Weight
    requiresShipping: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  """
  Weight type
  """
  type Weight {
    value: Int!
    unit: String!
  }

  # ===================================
  # Inputs
  # ===================================

  """
  Input for creating a product
  """
  input CreateProductInput {
    handle: String!
    title: String!
    description: String
    vendor: String
    productType: String
    status: ProductStatus
  }

  """
  Input for updating a product
  """
  input UpdateProductInput {
    title: String
    description: String
    vendor: String
    productType: String
    status: ProductStatus
  }

  """
  Input for creating a variant
  """
  input CreateVariantInput {
    sku: String!
    barcode: String
    title: String!
    price: Float!
    compareAtPrice: Float
    costPerItem: Float
    taxable: Boolean
    requiresShipping: Boolean
  }

  # ===================================
  # Queries
  # ===================================

  type Query {
    """
    Get all products
    """
    products(limit: Int, offset: Int, status: ProductStatus): [Product!]!

    """
    Get a single product by ID
    """
    product(id: ID!): Product

    """
    Get a product by handle
    """
    productByHandle(handle: String!): Product

    """
    Search products by title
    """
    searchProducts(query: String!): [Product!]!
  }

  # ===================================
  # Mutations
  # ===================================

  type Mutation {
    """
    Create a new product
    """
    createProduct(input: CreateProductInput!): Product!

    """
    Update an existing product
    """
    updateProduct(id: ID!, input: UpdateProductInput!): Product!

    """
    Delete a product
    """
    deleteProduct(id: ID!): Boolean!

    """
    Add a variant to a product
    """
    addVariant(productId: ID!, input: CreateVariantInput!): Variant!
  }
`;
