import { User, Role } from '../models/Auth.js';

/**
 * Auth Repository Interface
 *
 * SOLID Principles:
 * - Interface Segregation: Focused on auth data access
 * - Dependency Inversion: Services depend on this abstraction
 */
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(filters?: { isActive?: boolean; limit?: number }): Promise<User[]>;
  save(user: User): Promise<void>;
  update(id: string, updates: Partial<User>): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface IRoleRepository {
  findById(id: string): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  findAll(filters?: { isActive?: boolean }): Promise<Role[]>;
  save(role: Role): Promise<void>;
}
