import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { initDatabase, closeDatabase } from './core/infrastructure/database.js';
import { initRedis, closeRedis } from './core/infrastructure/redis.js';
import { eventBus } from './core/infrastructure/eventBus.js';
import { errorHandler } from './shared/middleware/errorHandler.js';

// Import routes
import { authRoutes } from './modules/auth/routes/authRoutes.js';
import { productRoutes } from './modules/products/routes/productRoutes.js';
import { orderRoutes } from './modules/orders/routes/orderRoutes.js';
import { customerRoutes } from './modules/customers/routes/customerRoutes.js';
import { inventoryRoutes } from './modules/inventory/routes/inventoryRoutes.js';
import { posRoutes } from './modules/pos/routes/posRoutes.js';
import { promotionRoutes } from './modules/promotions/routes/promotionRoutes.js';
import { webhookRoutes } from './modules/webhooks/routes/webhookRoutes.js';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3001'],
    credentials: true,
  })
);

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
const api = new Hono();

api.route('/auth', authRoutes);
api.route('/products', productRoutes);
api.route('/orders', orderRoutes);
api.route('/customers', customerRoutes);
api.route('/inventory', inventoryRoutes);
api.route('/pos', posRoutes);
api.route('/promotions', promotionRoutes);
api.route('/webhooks', webhookRoutes);

app.route('/api/v1', api);

// 404 handler
app.notFound((c) => {
  return c.json({ error: { code: 'NOT_FOUND', message: 'Route not found' } }, 404);
});

// Error handler
app.onError(errorHandler);

// Initialize infrastructure
async function bootstrap() {
  try {
    console.log('🚀 Starting E-commerce Backend...');

    // Initialize database
    initDatabase(process.env.DATABASE_URL!);
    console.log('✅ Database connected');

    // Initialize Redis
    initRedis({
      host: process.env.REDIS_HOST!,
      port: parseInt(process.env.REDIS_PORT!),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
    });
    console.log('✅ Redis connected');

    // Initialize Event Bus
    await eventBus.connect(process.env.NATS_URL!);
    console.log('✅ Event Bus connected');

    // Start server
    const port = parseInt(process.env.PORT || '3000');
    console.log(`🌐 Server running on http://localhost:${port}`);
    console.log(`📚 API Docs: http://localhost:${port}/api/v1`);

    serve({
      fetch: app.fetch,
      port,
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏳ Shutting down gracefully...');
  await closeDatabase();
  await closeRedis();
  await eventBus.close();
  console.log('✅ Shutdown complete');
  process.exit(0);
});

// Start the application
bootstrap();
