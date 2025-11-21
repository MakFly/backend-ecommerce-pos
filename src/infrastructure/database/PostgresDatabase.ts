import postgres from 'postgres';
import { IDatabase, ITransaction } from '@shared/interfaces/IDatabase.js';

/**
 * PostgreSQL Database Implementation
 *
 * SOLID Principles:
 * - Single Responsibility: Database operations only
 * - Dependency Inversion: Implements IDatabase interface
 */
export class PostgresDatabase implements IDatabase {
  private sql: ReturnType<typeof postgres>;

  constructor(connectionString: string) {
    this.sql = postgres(connectionString, {
      max: parseInt(process.env.DB_POOL_MAX || '10'),
      idle_timeout: 20,
      connect_timeout: 30,
    });
  }

  async query<T>(sql: string, params?: unknown[]): Promise<T[]> {
    const rows = await this.sql.unsafe(sql, params || []);
    return rows as T[];
  }

  async execute(sql: string, params?: unknown[]): Promise<void> {
    await this.sql.unsafe(sql, params || []);
  }

  async transaction<T>(callback: (tx: ITransaction) => Promise<T>): Promise<T> {
    return await this.sql.begin(async (sql) => {
      const tx = new PostgresTransaction(sql);
      return await callback(tx);
    });
  }

  async close(): Promise<void> {
    await this.sql.end();
  }
}

class PostgresTransaction implements ITransaction {
  constructor(private sql: any) {}

  async query<T>(sql: string, params?: unknown[]): Promise<T[]> {
    const rows = await this.sql.unsafe(sql, params || []);
    return rows as T[];
  }

  async execute(sql: string, params?: unknown[]): Promise<void> {
    await this.sql.unsafe(sql, params || []);
  }

  async commit(): Promise<void> {
    // Handled by postgres.js
  }

  async rollback(): Promise<void> {
    // Handled by postgres.js
  }
}
