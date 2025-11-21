/**
 * Database Interface
 *
 * SOLID Principles:
 * - Dependency Inversion Principle (DIP): Abstract database operations
 * - Open/Closed Principle (OCP): Can switch DB implementations
 */
export interface IDatabase {
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
  execute(sql: string, params?: unknown[]): Promise<void>;
  transaction<T>(callback: (tx: ITransaction) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

export interface ITransaction {
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
  execute(sql: string, params?: unknown[]): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}
