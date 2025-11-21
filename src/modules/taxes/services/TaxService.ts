import { TaxCalculationDto, TaxCalculation, TaxRate } from '../models/Tax.js';

export class TaxService {
  async calculateTax(dto: TaxCalculationDto): Promise<TaxCalculation> {
    // Get tax rates for country/region
    // Apply rates in priority order
    // Handle compound taxes
    // Calculate total

    // Mock implementation
    const taxRate = this.getTaxRateForRegion(dto.country, dto.region);
    const taxAmount = (dto.subtotal * taxRate) / 100;

    return {
      taxAmount,
      taxRate,
      breakdown: [
        {
          name: dto.region ? `${dto.region} Tax` : `${dto.country} Tax`,
          rate: taxRate,
          amount: taxAmount,
        },
      ],
    };
  }

  private getTaxRateForRegion(country: string, region?: string): number {
    // Mock rates
    const rates: Record<string, number> = {
      US: 8.5,
      CA: 13,
      GB: 20,
      FR: 20,
      DE: 19,
    };

    return rates[country] || 0;
  }
}
