import { POSSession, POSSale } from '../models/POS.js';

/**
 * POS Repository Interface
 *
 * SOLID Principles:
 * - Interface Segregation: Focused on POS data access
 * - Dependency Inversion: Services depend on this abstraction
 */
export interface IPOSSessionRepository {
  findById(id: string): Promise<POSSession | null>;
  findAll(filters?: { status?: string; limit?: number }): Promise<POSSession[]>;
  save(session: POSSession): Promise<void>;
  update(id: string, updates: Partial<POSSession>): Promise<void>;
}

export interface IPOSSaleRepository {
  findById(id: string): Promise<POSSale | null>;
  findBySession(sessionId: string, limit?: number): Promise<POSSale[]>;
  save(sale: POSSale): Promise<void>;
}
