/**
 * Base Service Interface
 *
 * SOLID Principles:
 * - Single Responsibility Principle (SRP): Service handles business logic only
 * - Interface Segregation Principle (ISP): Minimal interface
 */
export interface IService {
  // Marker interface - services can extend with specific methods
}

/**
 * CRUD Service Interface
 */
export interface ICrudService<T, CreateDto, UpdateDto> extends IService {
  create(data: CreateDto): Promise<T>;
  getById(id: string): Promise<T>;
  getAll(options?: QueryOptions): Promise<T[]>;
  update(id: string, data: UpdateDto): Promise<T>;
  delete(id: string): Promise<void>;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  filters?: Record<string, unknown>;
}
