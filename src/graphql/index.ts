import { createYoga } from 'graphql-yoga';
import { typeDefs } from './schema/index.js';
import { resolvers } from './resolvers/index.js';
import { IDatabase } from '@shared/interfaces/IDatabase.js';
import { ICache } from '@shared/interfaces/ICache.js';
import { IEventBus } from '@shared/interfaces/IEventBus.js';
import { ProductService } from '@modules/products/services/ProductService.js';
import { OrderService } from '@modules/orders/services/OrderService.js';
import { CustomerService } from '@modules/customers/services/CustomerService.js';
import { InventoryService } from '@modules/inventory/services/InventoryService.js';
import { POSService } from '@modules/pos/services/POSService.js';
import { AuthService } from '@modules/auth/services/AuthService.js';
import { ShippingService } from '@modules/shipping/services/ShippingService.js';
import { TaxService } from '@modules/taxes/services/TaxService.js';
import { PromotionService } from '@modules/promotions/services/PromotionService.js';

/**
 * GraphQL Context Type
 *
 * Available in all resolvers via context parameter
 */
export interface GraphQLContext {
  // Infrastructure
  database: IDatabase;
  cache: ICache;
  eventBus: IEventBus;

  // Services (injected)
  productService: ProductService;
  orderService: OrderService;
  customerService: CustomerService;
  inventoryService: InventoryService;
  posService: POSService;
  authService: AuthService;
  shippingService: ShippingService;
  taxService: TaxService;
  promotionService: PromotionService;
}

/**
 * Create GraphQL Handler
 *
 * SOLID Principles:
 * - Dependency Injection: Services passed from main.ts
 * - Single Responsibility: GraphQL setup only
 */
export function createGraphQLHandler(context: GraphQLContext) {
  const yoga = createYoga({
    schema: {
      typeDefs,
      resolvers,
    },
    context: () => context,
    graphiql: {
      title: 'E-commerce API',
      defaultQuery: `# 🎉 Welcome to E-commerce GraphQL API!
#
# Examples:

# 1. Get all products
query GetProducts {
  products(limit: 10) {
    id
    title
    handle
    status
    vendor
  }
}

# 2. Get a single product
query GetProduct {
  product(id: "product-id-here") {
    id
    title
    description
    status
    variants {
      id
      sku
      price
    }
  }
}

# 3. Create a product
mutation CreateProduct {
  createProduct(input: {
    handle: "awesome-product"
    title: "Awesome Product"
    description: "This is an awesome product"
    status: ACTIVE
  }) {
    id
    title
    handle
  }
}

# 4. Update a product
mutation UpdateProduct {
  updateProduct(
    id: "product-id-here"
    input: {
      title: "Updated Title"
      status: ACTIVE
    }
  ) {
    id
    title
    status
  }
}`,
    },
  });

  return yoga;
}
