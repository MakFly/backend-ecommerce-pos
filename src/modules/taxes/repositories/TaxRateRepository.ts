import { ITaxRateRepository } from './ITaxRepository.js';
import { TaxRate } from '../models/Tax.js';
import { IDatabase } from '@shared/interfaces/IDatabase.js';

/**
 * Tax Rate Repository
 */
export class TaxRateRepository implements ITaxRateRepository {
  constructor(private readonly db: IDatabase) {}

  async findById(id: string): Promise<TaxRate | null> {
    const rows = await this.db.query<any>(
      `SELECT * FROM tax_rates WHERE id = $1`,
      [id]
    );
    return rows.length > 0 ? this.mapToTaxRate(rows[0]) : null;
  }

  async findByCountry(country: string): Promise<TaxRate[]> {
    const rows = await this.db.query<any>(
      `SELECT * FROM tax_rates WHERE country = $1 AND is_active = true
       ORDER BY priority ASC`,
      [country]
    );
    return rows.map(this.mapToTaxRate);
  }

  async findByRegion(country: string, region: string): Promise<TaxRate[]> {
    const rows = await this.db.query<any>(
      `SELECT * FROM tax_rates
       WHERE country = $1 AND (region = $2 OR region IS NULL) AND is_active = true
       ORDER BY priority ASC`,
      [country, region]
    );
    return rows.map(this.mapToTaxRate);
  }

  async findAll(filters?: { isActive?: boolean }): Promise<TaxRate[]> {
    let query = `SELECT * FROM tax_rates`;
    const params: any[] = [];

    if (filters?.isActive !== undefined) {
      query += ` WHERE is_active = $1`;
      params.push(filters.isActive);
    }

    query += ` ORDER BY country, region, priority`;

    const rows = await this.db.query<any>(query, params);
    return rows.map(this.mapToTaxRate);
  }

  async save(taxRate: TaxRate): Promise<void> {
    await this.db.execute(
      `INSERT INTO tax_rates (
        id, name, country, region, rate, is_compound, priority, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        name = $2, country = $3, region = $4, rate = $5,
        is_compound = $6, priority = $7, is_active = $8`,
      [
        taxRate.id,
        taxRate.name,
        taxRate.country,
        taxRate.region,
        taxRate.rate,
        taxRate.isCompound,
        taxRate.priority,
        taxRate.isActive,
      ]
    );
  }

  private mapToTaxRate(row: any): TaxRate {
    return {
      id: row.id,
      name: row.name,
      country: row.country,
      region: row.region,
      rate: parseFloat(row.rate),
      isCompound: row.is_compound,
      priority: row.priority,
      isActive: row.is_active,
    };
  }
}
