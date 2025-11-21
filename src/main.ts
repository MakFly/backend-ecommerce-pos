/**
 * E-commerce Backend + POS
 * Architecture: TDD + SOLID Principles
 *
 * Main Application Entry Point
 */
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { container } from './shared/container/Container.js';
import { PostgresDatabase } from './infrastructure/database/PostgresDatabase.js';
import { RedisCache } from './infrastructure/cache/RedisCache.js';
import { NatsEventBus } from './infrastructure/events/NatsEventBus.js';
import { errorHandler } from './shared/middleware/errorHandler.js';

// Import route factories
import { createProductRoutes } from './modules/products/routes.js';

const app = new Hono();

/**
 * Bootstrap Application
 * Sets up infrastructure and dependency injection
 */
async function bootstrap() {
  try {
    console.log('🚀 Starting E-commerce Backend (TDD + SOLID)...\n');

    // ===================================
    // Infrastructure Setup
    // ===================================

    // Database
    const database = new PostgresDatabase(process.env.DATABASE_URL!);
    container.registerSingleton('database', () => database);
    console.log('✅ Database connected (PostgreSQL)');

    // Cache
    const cache = new RedisCache({
      host: process.env.REDIS_HOST!,
      port: parseInt(process.env.REDIS_PORT!),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
    });
    container.registerSingleton('cache', () => cache);
    console.log('✅ Cache connected (Redis)');

    // Event Bus
    const eventBus = new NatsEventBus();
    await eventBus.connect(process.env.NATS_URL!);
    container.registerSingleton('eventBus', () => eventBus);
    console.log('✅ Event Bus connected (NATS)');

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
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    // ===================================
    // API Routes (Dependency Injection)
    // ===================================
    const api = new Hono();

    // Products module (fully implemented with TDD)
    const productRoutes = createProductRoutes(database);
    api.route('/products', productRoutes);

    // TODO: Other modules (implement with TDD)
    // api.route('/orders', createOrderRoutes(database));
    // api.route('/customers', createCustomerRoutes(database));
    // api.route('/inventory', createInventoryRoutes(database));
    // api.route('/pos', createPosRoutes(database));
    // api.route('/auth', createAuthRoutes(database, cache));

    app.route('/api/v1', api);

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
    console.log(`\n🌐 Server running on http://localhost:${port}`);
    console.log(`📚 API: http://localhost:${port}/api/v1`);
    console.log(`💚 Health: http://localhost:${port}/health\n`);

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

  try {
    const database = container.resolve<PostgresDatabase>('database');
    const cache = container.resolve<RedisCache>('cache');
    const eventBus = container.resolve<NatsEventBus>('eventBus');

    await database.close();
    await cache.close();
    await eventBus.close();

    console.log('✅ Shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

// Start
bootstrap();
