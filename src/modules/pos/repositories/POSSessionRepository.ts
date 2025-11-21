import { IPOSSessionRepository } from './IPOSRepository.js';
import { POSSession } from '../models/POS.js';
import { IDatabase } from '@shared/interfaces/IDatabase.js';

/**
 * POS Session Repository
 *
 * SOLID Principles:
 * - Single Responsibility: POS session data access only
 * - Dependency Inversion: Depends on IDatabase abstraction
 */
export class POSSessionRepository implements IPOSSessionRepository {
  constructor(private readonly db: IDatabase) {}

  async findById(id: string): Promise<POSSession | null> {
    const rows = await this.db.query<any>(
      `SELECT * FROM pos_sessions WHERE id = $1`,
      [id]
    );

    if (rows.length === 0) return null;

    return this.mapToPOSSession(rows[0]);
  }

  async findAll(filters?: { status?: string; limit?: number }): Promise<POSSession[]> {
    let query = `SELECT * FROM pos_sessions`;
    const params: any[] = [];

    if (filters?.status) {
      query += ` WHERE status = $1`;
      params.push(filters.status);
    }

    query += ` ORDER BY opened_at DESC`;

    if (filters?.limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(filters.limit);
    }

    const rows = await this.db.query<any>(query, params);
    return rows.map(this.mapToPOSSession);
  }

  async save(session: POSSession): Promise<void> {
    await this.db.execute(
      `INSERT INTO pos_sessions (
        id, session_number, location_id, cashier_id, status, opening_cash,
        closing_cash, expected_cash, total_sales, total_transactions,
        opened_at, closed_at, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        session.id,
        session.sessionNumber,
        session.locationId,
        session.cashierId,
        session.status,
        session.openingCash,
        session.closingCash,
        session.expectedCash,
        session.totalSales,
        session.totalTransactions,
        session.openedAt,
        session.closedAt,
        JSON.stringify(session.metadata),
      ]
    );
  }

  async update(id: string, updates: Partial<POSSession>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.status !== undefined) {
      fields.push(`status = $${paramIndex++}`);
      values.push(updates.status);
    }
    if (updates.closingCash !== undefined) {
      fields.push(`closing_cash = $${paramIndex++}`);
      values.push(updates.closingCash);
    }
    if (updates.expectedCash !== undefined) {
      fields.push(`expected_cash = $${paramIndex++}`);
      values.push(updates.expectedCash);
    }
    if (updates.totalSales !== undefined) {
      fields.push(`total_sales = $${paramIndex++}`);
      values.push(updates.totalSales);
    }
    if (updates.totalTransactions !== undefined) {
      fields.push(`total_transactions = $${paramIndex++}`);
      values.push(updates.totalTransactions);
    }
    if (updates.closedAt !== undefined) {
      fields.push(`closed_at = $${paramIndex++}`);
      values.push(updates.closedAt);
    }

    if (fields.length === 0) return;

    values.push(id);
    const query = `UPDATE pos_sessions SET ${fields.join(', ')} WHERE id = $${paramIndex}`;

    await this.db.execute(query, values);
  }

  private mapToPOSSession(row: any): POSSession {
    return {
      id: row.id,
      sessionNumber: row.session_number,
      locationId: row.location_id,
      cashierId: row.cashier_id,
      status: row.status,
      openingCash: parseFloat(row.opening_cash),
      closingCash: row.closing_cash ? parseFloat(row.closing_cash) : undefined,
      expectedCash: row.expected_cash ? parseFloat(row.expected_cash) : undefined,
      totalSales: parseFloat(row.total_sales),
      totalTransactions: row.total_transactions,
      openedAt: row.opened_at,
      closedAt: row.closed_at,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
    };
  }
}
