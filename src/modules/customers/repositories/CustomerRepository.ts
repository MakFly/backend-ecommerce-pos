import { ICustomerRepository } from './ICustomerRepository.js';
import { Customer } from '../models/Customer.js';
import { IDatabase } from '@shared/interfaces/IDatabase.js';

export class CustomerRepository implements ICustomerRepository {
  constructor(private readonly db: IDatabase) {}

  async findById(id: string): Promise<Customer | null> {
    const rows = await this.db.query<any>(
      `SELECT c.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', a.id,
              'customerId', a.customer_id,
              'firstName', a.first_name,
              'lastName', a.last_name,
              'company', a.company,
              'address1', a.address1,
              'address2', a.address2,
              'city', a.city,
              'province', a.province,
              'country', a.country,
              'zip', a.zip,
              'phone', a.phone,
              'isDefault', a.is_default
            )
          ) FILTER (WHERE a.id IS NOT NULL), '[]'
        ) as addresses
      FROM customers c
      LEFT JOIN addresses a ON c.id = a.customer_id
      WHERE c.id = $1
      GROUP BY c.id`,
      [id]
    );

    if (!rows[0]) return null;
    return this.mapToCustomer(rows[0]);
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const rows = await this.db.query<any>(
      `SELECT c.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', a.id,
              'customerId', a.customer_id,
              'firstName', a.first_name,
              'lastName', a.last_name,
              'company', a.company,
              'address1', a.address1,
              'address2', a.address2,
              'city', a.city,
              'province', a.province,
              'country', a.country,
              'zip', a.zip,
              'phone', a.phone,
              'isDefault', a.is_default
            )
          ) FILTER (WHERE a.id IS NOT NULL), '[]'
        ) as addresses
      FROM customers c
      LEFT JOIN addresses a ON c.id = a.customer_id
      WHERE c.email = $1
      GROUP BY c.id`,
      [email]
    );

    if (!rows[0]) return null;
    return this.mapToCustomer(rows[0]);
  }

  async findAll(options?: any): Promise<Customer[]> {
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;

    const rows = await this.db.query<any>(
      `SELECT c.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', a.id,
              'customerId', a.customer_id,
              'firstName', a.first_name,
              'lastName', a.last_name,
              'company', a.company,
              'address1', a.address1,
              'address2', a.address2,
              'city', a.city,
              'province', a.province,
              'country', a.country,
              'zip', a.zip,
              'phone', a.phone,
              'isDefault', a.is_default
            )
          ) FILTER (WHERE a.id IS NOT NULL), '[]'
        ) as addresses
      FROM customers c
      LEFT JOIN addresses a ON c.id = a.customer_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return rows.map(this.mapToCustomer);
  }

  async findBy(criteria: Record<string, unknown>): Promise<Customer[]> {
    return this.findAll();
  }

  async count(): Promise<number> {
    const rows = await this.db.query<{ count: string }>(
      'SELECT COUNT(*) as count FROM customers'
    );
    return parseInt(rows[0].count, 10);
  }

  async save(customer: Customer): Promise<void> {
    await this.db.execute(
      `INSERT INTO customers (
        id, email, first_name, last_name, phone, accepts_marketing, metadata, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        phone = EXCLUDED.phone,
        accepts_marketing = EXCLUDED.accepts_marketing,
        metadata = EXCLUDED.metadata,
        updated_at = EXCLUDED.updated_at`,
      [
        customer.id,
        customer.email,
        customer.firstName,
        customer.lastName,
        customer.phone || null,
        customer.acceptsMarketing,
        JSON.stringify(customer.metadata || {}),
        customer.createdAt,
        customer.updatedAt,
      ]
    );

    // Save addresses
    for (const address of customer.addresses) {
      await this.db.execute(
        `INSERT INTO addresses (
          id, customer_id, first_name, last_name, company, address1, address2,
          city, province, country, zip, phone, is_default
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO NOTHING`,
        [
          address.id,
          customer.id,
          address.firstName,
          address.lastName,
          address.company || null,
          address.address1,
          address.address2 || null,
          address.city,
          address.province,
          address.country,
          address.zip,
          address.phone || null,
          address.isDefault,
        ]
      );
    }
  }

  async update(id: string, customer: Partial<Customer>): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (customer.firstName) {
      fields.push(`first_name = $${paramIndex++}`);
      values.push(customer.firstName);
    }
    if (customer.lastName) {
      fields.push(`last_name = $${paramIndex++}`);
      values.push(customer.lastName);
    }
    if (customer.phone !== undefined) {
      fields.push(`phone = $${paramIndex++}`);
      values.push(customer.phone);
    }
    if (customer.acceptsMarketing !== undefined) {
      fields.push(`accepts_marketing = $${paramIndex++}`);
      values.push(customer.acceptsMarketing);
    }

    fields.push(`updated_at = $${paramIndex++}`);
    values.push(new Date());
    values.push(id);

    await this.db.execute(
      `UPDATE customers SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
      values
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.execute('DELETE FROM customers WHERE id = $1', [id]);
  }

  private mapToCustomer(row: any): Customer {
    return {
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      phone: row.phone,
      acceptsMarketing: row.accepts_marketing,
      addresses: row.addresses || [],
      metadata: row.metadata,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
