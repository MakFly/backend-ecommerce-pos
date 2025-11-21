/**
 * Base Repository Interface
 *
 * SOLID Principles:
 * - Interface Segregation Principle (ISP): Small, focused interface
 * - Dependency Inversion Principle (DIP): Depend on abstraction, not implementation
 */
export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(options?: FindOptions): Promise<T[]>;
  save(entity: T): Promise<void>;
  update(id: string, entity: Partial<T>): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface FindOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

/**
 * Queryable Repository Interface
 * Extends base repository with query capabilities
 */
export interface IQueryableRepository<T> extends IRepository<T> {
  findBy(criteria: Record<string, unknown>): Promise<T[]>;
  count(criteria?: Record<string, unknown>): Promise<number>;
}
