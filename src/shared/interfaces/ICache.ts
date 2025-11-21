/**
 * Cache Interface
 *
 * SOLID Principles:
 * - Interface Segregation Principle (ISP): Focused cache operations
 * - Dependency Inversion Principle (DIP): Abstract caching layer
 */
export interface ICache {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  exists(key: string): Promise<boolean>;
}
