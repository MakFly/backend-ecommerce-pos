import { IRoleRepository } from './IAuthRepository.js';
import { Role } from '../models/Auth.js';
import { IDatabase } from '@shared/interfaces/IDatabase.js';

/**
 * Role Repository
 *
 * SOLID Principles:
 * - Single Responsibility: Role data access only
 * - Dependency Inversion: Depends on IDatabase abstraction
 */
export class RoleRepository implements IRoleRepository {
  constructor(private readonly db: IDatabase) {}

  async findById(id: string): Promise<Role | null> {
    const rows = await this.db.query<any>(
      `SELECT * FROM roles WHERE id = $1`,
      [id]
    );

    if (rows.length === 0) return null;

    return this.mapToRole(rows[0]);
  }

  async findByName(name: string): Promise<Role | null> {
    const rows = await this.db.query<any>(
      `SELECT * FROM roles WHERE name = $1`,
      [name]
    );

    if (rows.length === 0) return null;

    return this.mapToRole(rows[0]);
  }

  async findAll(filters?: { isActive?: boolean }): Promise<Role[]> {
    let query = `SELECT * FROM roles`;
    const params: any[] = [];

    if (filters?.isActive !== undefined) {
      query += ` WHERE is_active = $1`;
      params.push(filters.isActive);
    }

    query += ` ORDER BY name`;

    const rows = await this.db.query<any>(query, params);
    return rows.map(this.mapToRole);
  }

  async save(role: Role): Promise<void> {
    await this.db.execute(
      `INSERT INTO roles (
        id, name, description, permissions, is_active, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        name = $2, description = $3, permissions = $4, is_active = $5`,
      [
        role.id,
        role.name,
        role.description,
        JSON.stringify(role.permissions),
        role.isActive,
        role.createdAt,
      ]
    );
  }

  private mapToRole(row: any): Role {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      permissions: typeof row.permissions === 'string' ? JSON.parse(row.permissions) : row.permissions,
      isActive: row.is_active,
      createdAt: row.created_at,
    };
  }
}
