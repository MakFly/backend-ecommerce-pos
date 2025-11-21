import Redis from 'ioredis';

let redis: Redis | null = null;

export function initRedis(config: {
  host: string;
  port: number;
  password?: string;
  db?: number;
}) {
  if (redis) {
    return redis;
  }

  redis = new Redis({
    host: config.host,
    port: config.port,
    password: config.password,
    db: config.db || 0,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  redis.on('error', (err) => {
    console.error('Redis error:', err);
  });

  return redis;
}

export function getRedis() {
  if (!redis) {
    throw new Error('Redis not initialized. Call initRedis first.');
  }
  return redis;
}

export async function closeRedis() {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
