/**
 * E-commerce Backend + POS
 * Architecture: TDD + SOLID + GraphQL
 *
 * Main Application Entry Point
 * - Classic Dependency Injection (no Container)
 * - REST + GraphQL APIs
 */
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { errorHandler } from './shared/middleware/errorHandler.js';

// Infrastructure
import { PostgresDatabase } from './infrastructure/database/PostgresDatabase.js';
import { RedisCache } from './infrastructure/cache/RedisCache.js';
import { NatsEventBus } from './infrastructure/events/NatsEventBus.js';

// Modules - Products
import { ProductRepository } from './modules/products/repositories/ProductRepository.js';
import { ProductService } from './modules/products/services/ProductService.js';
import { ProductController } from './modules/products/controllers/ProductController.js';
import { createProductRoutes } from './modules/products/routes.js';

// Modules - Orders
import { OrderRepository } from './modules/orders/repositories/OrderRepository.js';
import { OrderService } from './modules/orders/services/OrderService.js';
import { OrderController } from './modules/orders/controllers/OrderController.js';
import { createOrderRoutes } from './modules/orders/routes.js';

// Modules - Customers
import { CustomerRepository } from './modules/customers/repositories/CustomerRepository.js';
import { CustomerService } from './modules/customers/services/CustomerService.js';
import { createCustomerRoutes } from './modules/customers/routes.js';

// Modules - Inventory
import { InventoryService } from './modules/inventory/services/InventoryService.js';

// Modules - POS
import { POSService } from './modules/pos/services/POSService.js';

// Modules - Auth
import { AuthService } from './modules/auth/services/AuthService.js';

// Modules - Shipping
import { ShippingService } from './modules/shipping/services/ShippingService.js';

// Modules - Taxes
import { TaxService } from './modules/taxes/services/TaxService.js';

// Modules - Promotions
import { PromotionService } from './modules/promotions/services/PromotionService.js';

// GraphQL
import { createGraphQLHandler } from './graphql/index.js';

const app = new Hono();

/**
 * Bootstrap Application
 * Classic Dependency Injection (manual wiring)
 */
async function bootstrap() {
  try {
    console.log('🚀 Starting E-commerce Backend (TDD + SOLID + GraphQL)...\n');

    // ===================================
    // Infrastructure Layer
    // ===================================
    console.log('📦 Initializing infrastructure...');

    const database = new PostgresDatabase(process.env.DATABASE_URL!);
    console.log('  ✅ Database (PostgreSQL)');

    const cache = new RedisCache({
      host: process.env.REDIS_HOST!,
      port: parseInt(process.env.REDIS_PORT!),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
    });
    console.log('  ✅ Cache (Redis)');

    const eventBus = new NatsEventBus();
    await eventBus.connect(process.env.NATS_URL!);
    console.log('  ✅ Event Bus (NATS)');

    // ===================================
    // Dependency Injection (Classic)
    // ===================================
    console.log('\n🔌 Wiring dependencies (Classic DI)...');

    // Products Module
    const productRepository = new ProductRepository(database);
    const productService = new ProductService(productRepository);
    const productController = new ProductController(productService);
    console.log('  ✅ Products module');

    // Orders Module
    const orderRepository = new OrderRepository(database);
    const orderService = new OrderService(orderRepository);
    const orderController = new OrderController(orderService);
    console.log('  ✅ Orders module');

    // Customers Module
    const customerRepository = new CustomerRepository(database);
    const customerService = new CustomerService(customerRepository);
    console.log('  ✅ Customers module');

    // Inventory Module
    const inventoryService = new InventoryService();
    console.log('  ✅ Inventory module');

    // POS Module
    const posService = new POSService();
    console.log('  ✅ POS module');

    // Auth Module
    const authService = new AuthService();
    console.log('  ✅ Auth module');

    // Shipping Module
    const shippingService = new ShippingService();
    console.log('  ✅ Shipping module');

    // Taxes Module
    const taxService = new TaxService();
    console.log('  ✅ Taxes module');

    // Promotions Module
    const promotionService = new PromotionService();
    console.log('  ✅ Promotions module');

    // ===================================
    // Middleware
    // ===================================
    app.use('*', logger());
    app.use(
      '*',
      cors({
        origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3001'],
        credentials: true,
      })
    );

    // ===================================
    // Health Check
    // ===================================
    app.get('/health', (c) => {
      return c.json({
        status: 'healthy',
        architecture: 'TDD + SOLID',
        apis: ['REST', 'GraphQL'],
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    // ===================================
    // REST API Routes
    // ===================================
    console.log('\n🌐 Configuring REST API...');
    const api = new Hono();

    const productRoutes = createProductRoutes(database);
    api.route('/products', productRoutes);
    console.log('  ✅ /api/v1/products');

    const orderRoutes = createOrderRoutes(database);
    api.route('/orders', orderRoutes);
    console.log('  ✅ /api/v1/orders');

    const customerRoutes = createCustomerRoutes(database);
    api.route('/customers', customerRoutes);
    console.log('  ✅ /api/v1/customers');

    // TODO: Add routes for other modules when ready
    // api.route('/inventory', inventoryRoutes);
    // api.route('/pos', posRoutes);
    // api.route('/auth', authRoutes);
    // api.route('/shipping', shippingRoutes);
    // api.route('/taxes', taxRoutes);
    // api.route('/promotions', promotionRoutes);

    // Mount REST API
    app.route('/api/v1', api);

    // ===================================
    // GraphQL API
    // ===================================
    console.log('\n⚡ Configuring GraphQL API...');
    const graphqlHandler = createGraphQLHandler({
      database,
      cache,
      eventBus,
      // Services (for GraphQL resolvers)
      productService,
      orderService,
      customerService,
      inventoryService,
      posService,
      authService,
      shippingService,
      taxService,
      promotionService,
    });

    // Mount GraphQL endpoint
    app.all('/graphql', async (c) => {
      return graphqlHandler(c.req.raw, c.env);
    });
    console.log('  ✅ /graphql (GraphQL Playground)');

    // ===================================
    // Error Handlers
    // ===================================
    app.notFound((c) => {
      return c.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Route not found',
          },
        },
        404
      );
    });

    app.onError(errorHandler);

    // ===================================
    // Start Server
    // ===================================
    const port = parseInt(process.env.PORT || '3000');
    console.log(`\n🎉 Server ready!\n`);
    console.log(`🌐 REST API:    http://localhost:${port}/api/v1`);
    console.log(`⚡ GraphQL:     http://localhost:${port}/graphql`);
    console.log(`💚 Health:      http://localhost:${port}/health\n`);

    serve({
      fetch: app.fetch,
      port,
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * Graceful Shutdown
 */
process.on('SIGINT', async () => {
  console.log('\n⏳ Shutting down gracefully...');
  // TODO: Close connections
  console.log('✅ Shutdown complete');
  process.exit(0);
});

// Start
bootstrap();
