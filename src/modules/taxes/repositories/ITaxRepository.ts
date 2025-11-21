import { TaxRate } from '../models/Tax.js';

/**
 * Tax Repository Interface
 */
export interface ITaxRateRepository {
  findById(id: string): Promise<TaxRate | null>;
  findByCountry(country: string): Promise<TaxRate[]>;
  findByRegion(country: string, region: string): Promise<TaxRate[]>;
  findAll(filters?: { isActive?: boolean }): Promise<TaxRate[]>;
  save(taxRate: TaxRate): Promise<void>;
}
