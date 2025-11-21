import { IUserRepository } from './IAuthRepository.js';
import { User } from '../models/Auth.js';
import { IDatabase } from '@shared/interfaces/IDatabase.js';

/**
 * User Repository
 *
 * SOLID Principles:
 * - Single Responsibility: User data access only
 * - Dependency Inversion: Depends on IDatabase abstraction
 */
export class UserRepository implements IUserRepository {
  constructor(private readonly db: IDatabase) {}

  async findById(id: string): Promise<User | null> {
    const rows = await this.db.query<any>(
      `SELECT u.*,
        json_agg(
          jsonb_build_object(
            'id', r.id,
            'name', r.name,
            'description', r.description,
            'permissions', r.permissions,
            'isActive', r.is_active,
            'createdAt', r.created_at
          )
        ) FILTER (WHERE r.id IS NOT NULL) as roles
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.id = $1
       GROUP BY u.id`,
      [id]
    );

    if (rows.length === 0) return null;

    return this.mapToUser(rows[0]);
  }

  async findByEmail(email: string): Promise<User | null> {
    const rows = await this.db.query<any>(
      `SELECT u.*,
        json_agg(
          jsonb_build_object(
            'id', r.id,
            'name', r.name,
            'description', r.description,
            'permissions', r.permissions,
            'isActive', r.is_active,
            'createdAt', r.created_at
          )
        ) FILTER (WHERE r.id IS NOT NULL) as roles
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.email = $1
       GROUP BY u.id`,
      [email]
    );

    if (rows.length === 0) return null;

    return this.mapToUser(rows[0]);
  }

  async findAll(filters?: { isActive?: boolean; limit?: number }): Promise<User[]> {
    let query = `
      SELECT u.*,
        json_agg(
          jsonb_build_object(
            'id', r.id,
            'name', r.name,
            'description', r.description,
            'permissions', r.permissions,
            'isActive', r.is_active,
            'createdAt', r.created_at
          )
        ) FILTER (WHERE r.id IS NOT NULL) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
    `;
    const params: any[] = [];

    if (filters?.isActive !== undefined) {
      query += ` WHERE u.is_active = $1`;
      params.push(filters.isActive);
    }

    query += ` GROUP BY u.id ORDER BY u.created_at DESC`;

    if (filters?.limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(filters.limit);
    }

    const rows = await this.db.query<any>(query, params);
    return rows.map(this.mapToUser);
  }

  async save(user: User): Promise<void> {
    await this.db.execute('BEGIN');

    try {
      // Insert user
      await this.db.execute(
        `INSERT INTO users (
          id, email, password_hash, first_name, last_name, phone, is_active,
          email_verified, last_login_at, metadata, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          user.id,
          user.email,
          user.passwordHash,
          user.firstName,
          user.lastName,
          user.phone,
          user.isActive,
          user.emailVerified,
          user.lastLoginAt,
          JSON.stringify(user.metadata),
          user.createdAt,
          user.updatedAt,
        ]
      );

      // Insert user roles
      for (const role of user.roles) {
        await this.db.execute(
          `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)
           ON CONFLICT (user_id, role_id) DO NOTHING`,
          [user.id, role.id]
        );
      }

      await this.db.execute('COMMIT');
    } catch (error) {
      await this.db.execute('ROLLBACK');
      throw error;
    }
  }

  async update(id: string, updates: Partial<User>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.email !== undefined) {
      fields.push(`email = $${paramIndex++}`);
      values.push(updates.email);
    }
    if (updates.firstName !== undefined) {
      fields.push(`first_name = $${paramIndex++}`);
      values.push(updates.firstName);
    }
    if (updates.lastName !== undefined) {
      fields.push(`last_name = $${paramIndex++}`);
      values.push(updates.lastName);
    }
    if (updates.phone !== undefined) {
      fields.push(`phone = $${paramIndex++}`);
      values.push(updates.phone);
    }
    if (updates.isActive !== undefined) {
      fields.push(`is_active = $${paramIndex++}`);
      values.push(updates.isActive);
    }
    if (updates.emailVerified !== undefined) {
      fields.push(`email_verified = $${paramIndex++}`);
      values.push(updates.emailVerified);
    }
    if (updates.lastLoginAt !== undefined) {
      fields.push(`last_login_at = $${paramIndex++}`);
      values.push(updates.lastLoginAt);
    }

    fields.push(`updated_at = $${paramIndex++}`);
    values.push(new Date());

    if (fields.length === 1) return; // Only updated_at

    values.push(id);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex}`;

    await this.db.execute(query, values);
  }

  async delete(id: string): Promise<void> {
    await this.db.execute('BEGIN');

    try {
      // Delete user roles
      await this.db.execute(`DELETE FROM user_roles WHERE user_id = $1`, [id]);

      // Delete user
      await this.db.execute(`DELETE FROM users WHERE id = $1`, [id]);

      await this.db.execute('COMMIT');
    } catch (error) {
      await this.db.execute('ROLLBACK');
      throw error;
    }
  }

  private mapToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      firstName: row.first_name,
      lastName: row.last_name,
      phone: row.phone,
      roles: row.roles || [],
      isActive: row.is_active,
      emailVerified: row.email_verified,
      lastLoginAt: row.last_login_at,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
