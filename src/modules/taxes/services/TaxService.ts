import { TaxCalculationDto, TaxCalculation, TaxRate, TaxBreakdown } from '../models/Tax.js';
import { ITaxRateRepository } from '../repositories/ITaxRepository.js';

/**
 * Tax Service
 *
 * SOLID Principles:
 * - Single Responsibility: Tax calculation only
 * - Dependency Inversion: Depends on repository abstractions
 */
export class TaxService {
  constructor(private readonly taxRateRepo: ITaxRateRepository) {}

  async calculateTax(dto: TaxCalculationDto): Promise<TaxCalculation> {
    // 1. Get tax rates for country/region
    const taxRates = dto.region
      ? await this.taxRateRepo.findByRegion(dto.country, dto.region)
      : await this.taxRateRepo.findByCountry(dto.country);

    if (taxRates.length === 0) {
      // No tax rates found
      return {
        taxAmount: 0,
        taxRate: 0,
        breakdown: [],
      };
    }

    // 2. Calculate taxes (supporting compound taxes)
    let runningSubtotal = dto.amount;
    const breakdown: TaxBreakdown[] = [];
    let totalTax = 0;

    for (const rate of taxRates) {
      const taxableAmount = rate.isCompound ? runningSubtotal + totalTax : runningSubtotal;
      const taxAmount = (taxableAmount * rate.rate) / 100;

      breakdown.push({
        name: rate.name,
        rate: rate.rate,
        amount: taxAmount,
      });

      totalTax += taxAmount;
    }

    // 3. Calculate effective tax rate
    const effectiveTaxRate = (totalTax / runningSubtotal) * 100;

    return {
      taxAmount: totalTax,
      taxRate: effectiveTaxRate,
      breakdown,
    };
  }

  async listTaxRates(filters?: { country?: string; region?: string; isActive?: boolean }): Promise<TaxRate[]> {
    if (filters?.region && filters?.country) {
      return this.taxRateRepo.findByRegion(filters.country, filters.region);
    }
    if (filters?.country) {
      return this.taxRateRepo.findByCountry(filters.country);
    }
    return this.taxRateRepo.findAll({ isActive: filters?.isActive });
  }
}
