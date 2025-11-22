import { Context } from 'hono';
import { IDatabase } from '@shared/interfaces/IDatabase.js';

/**
 * Health Check Response Interface
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: {
    database: ServiceStatus;
    redis?: ServiceStatus;
    nats?: ServiceStatus;
  };
  version?: string;
  environment?: string;
}

export interface ServiceStatus {
  status: 'up' | 'down';
  message?: string;
  latency?: number;
}

/**
 * Health Check Handler
 *
 * Performs health checks on all critical services:
 * - Database (PostgreSQL)
 * - Redis (optional)
 * - NATS (optional)
 *
 * Usage in main.ts:
 * ```typescript
 * app.get('/health', (c) => healthCheck(c, database));
 * ```
 */
export async function healthCheck(c: Context, database: IDatabase): Promise<Response> {
  const startTime = Date.now();

  const services: HealthCheckResponse['services'] = {
    database: await checkDatabase(database),
  };

  // Optional: Add Redis and NATS checks if clients are available
  // services.redis = await checkRedis(redisClient);
  // services.nats = await checkNATS(natsClient);

  const allServicesUp = Object.values(services).every((service) => service.status === 'up');

  const response: HealthCheckResponse = {
    status: allServicesUp ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services,
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  };

  const statusCode = allServicesUp ? 200 : 503;

  return c.json(response, statusCode);
}

/**
 * Check Database Connection
 */
async function checkDatabase(database: IDatabase): Promise<ServiceStatus> {
  const startTime = Date.now();

  try {
    // Simple query to check if database is responding
    await database.query('SELECT 1 as health');

    const latency = Date.now() - startTime;

    return {
      status: 'up',
      latency,
      message: 'Database connection successful',
    };
  } catch (error: any) {
    return {
      status: 'down',
      message: error.message || 'Database connection failed',
    };
  }
}

/**
 * Check Redis Connection (Optional)
 *
 * Uncomment and use when Redis client is available in main.ts
 */
// async function checkRedis(redisClient: any): Promise<ServiceStatus> {
//   const startTime = Date.now();
//
//   try {
//     await redisClient.ping();
//     const latency = Date.now() - startTime;
//
//     return {
//       status: 'up',
//       latency,
//       message: 'Redis connection successful',
//     };
//   } catch (error: any) {
//     return {
//       status: 'down',
//       message: error.message || 'Redis connection failed',
//     };
//   }
// }

/**
 * Check NATS Connection (Optional)
 *
 * Uncomment and use when NATS client is available in main.ts
 */
// async function checkNATS(natsClient: any): Promise<ServiceStatus> {
//   try {
//     const isConnected = natsClient.isConnected();
//
//     if (isConnected) {
//       return {
//         status: 'up',
//         message: 'NATS connection successful',
//       };
//     } else {
//       return {
//         status: 'down',
//         message: 'NATS not connected',
//       };
//     }
//   } catch (error: any) {
//     return {
//       status: 'down',
//       message: error.message || 'NATS connection failed',
//     };
//   }
// }

/**
 * Liveness Probe
 *
 * Simple endpoint that returns 200 if the server is running.
 * Does not check dependencies.
 *
 * Usage: GET /health/live
 */
export function livenessProbe(c: Context): Response {
  return c.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
}

/**
 * Readiness Probe
 *
 * Returns 200 only if the server is ready to handle requests
 * (all critical services are up).
 *
 * Usage: GET /health/ready
 */
export async function readinessProbe(c: Context, database: IDatabase): Promise<Response> {
  const dbStatus = await checkDatabase(database);

  if (dbStatus.status === 'up') {
    return c.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  } else {
    return c.json(
      {
        status: 'not ready',
        timestamp: new Date().toISOString(),
        reason: dbStatus.message,
      },
      503
    );
  }
}
