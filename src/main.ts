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

    // TODO: Other modules (Orders, Customers, etc.)
    // const orderRepository = new OrderRepository(database);
    // const orderService = new OrderService(orderRepository);
    // ...

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
