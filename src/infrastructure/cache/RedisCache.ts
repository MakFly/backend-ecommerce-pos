import Redis from 'ioredis';
import { ICache } from '@shared/interfaces/ICache.js';

/**
 * Redis Cache Implementation
 *
 * SOLID Principles:
 * - Single Responsibility: Caching operations only
 * - Dependency Inversion: Implements ICache interface
 */
export class RedisCache implements ICache {
  private redis: Redis;

  constructor(config: { host: string; port: number; password?: string; db?: number }) {
    this.redis = new Redis({
      host: config.host,
      port: config.port,
      password: config.password,
      db: config.db || 0,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });

    this.redis.on('error', (err) => {
      console.error('Redis error:', err);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);

    if (ttl) {
      await this.redis.setex(key, ttl, serialized);
    } else {
      await this.redis.set(key, serialized);
    }
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async clear(): Promise<void> {
    await this.redis.flushdb();
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(key);
    return result === 1;
  }

  async close(): Promise<void> {
    await this.redis.quit();
  }
}
