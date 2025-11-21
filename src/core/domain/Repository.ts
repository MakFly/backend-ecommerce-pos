import { Entity } from './Entity.js';

/**
 * Generic Repository Interface
 * Abstracts data access for domain entities
 */
export interface Repository<T extends Entity<unknown>> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<void>;
  delete(id: string): Promise<void>;
}

/**
 * Repository with common query operations
 */
export interface QueryableRepository<T extends Entity<unknown>> extends Repository<T> {
  findAll(options?: QueryOptions): Promise<T[]>;
  findMany(criteria: QueryCriteria): Promise<T[]>;
  count(criteria?: QueryCriteria): Promise<number>;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface QueryCriteria {
  [key: string]: unknown;
}
