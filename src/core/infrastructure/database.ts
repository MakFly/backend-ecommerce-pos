import postgres from 'postgres';

let sql: ReturnType<typeof postgres> | null = null;

export function initDatabase(connectionString: string) {
  if (sql) {
    return sql;
  }

  sql = postgres(connectionString, {
    max: parseInt(process.env.DB_POOL_MAX || '10'),
    idle_timeout: 20,
    connect_timeout: 30,
  });

  return sql;
}

export function getDatabase() {
  if (!sql) {
    throw new Error('Database not initialized. Call initDatabase first.');
  }
  return sql;
}

export async function closeDatabase() {
  if (sql) {
    await sql.end();
    sql = null;
  }
}
