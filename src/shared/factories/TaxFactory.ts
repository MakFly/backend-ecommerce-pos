import { faker } from '@faker-js/faker';
import {
  TaxRate,
  TaxCalculation,
  TaxBreakdown,
} from '@modules/taxes/models/Tax.js';

/**
 * Data Factory for Taxes
 *
 * SOLID Principles:
 * - Single Responsibility: Generate fake tax data only
 * - Open/Closed: Easy to extend with new methods
 *
 * Usage:
 * - Tests: Create fake tax rates and calculations for testing
 * - Seeding: Populate database with sample data
 */
export class TaxFactory {
  /**
   * Generate a fake tax rate
   */
  static createTaxRate(overrides?: Partial<TaxRate>): TaxRate {
    const country = faker.helpers.arrayElement(['US', 'CA', 'GB', 'FR', 'DE', 'AU', 'JP']);
    const rate = this.getDefaultRateForCountry(country);

    return {
      id: faker.string.nanoid(),
      name: `${country} Tax`,
      country,
      region: faker.location.state(),
      rate,
      isCompound: faker.datatype.boolean({ probability: 0.2 }),
      priority: faker.number.int({ min: 1, max: 10 }),
      isActive: faker.datatype.boolean({ probability: 0.9 }),
      ...overrides,
    };
  }

  /**
   * Generate a fake tax calculation
   */
  static createTaxCalculation(subtotal?: number, overrides?: Partial<TaxCalculation>): TaxCalculation {
    const amount = subtotal || faker.number.float({ min: 100, max: 1000, fractionDigits: 2 });
    const taxRate = faker.number.float({ min: 5, max: 25, fractionDigits: 2 });
    const taxAmount = (amount * taxRate) / 100;

    return {
      taxAmount,
      taxRate,
      breakdown: [this.createTaxBreakdown({ rate: taxRate, amount: taxAmount })],
      ...overrides,
    };
  }

  /**
   * Generate a fake tax breakdown
   */
  static createTaxBreakdown(overrides?: Partial<TaxBreakdown>): TaxBreakdown {
    const rate = faker.number.float({ min: 5, max: 25, fractionDigits: 2 });
    const amount = faker.number.float({ min: 5, max: 50, fractionDigits: 2 });

    return {
      name: faker.helpers.arrayElement(['VAT', 'GST', 'Sales Tax', 'State Tax', 'Federal Tax']),
      rate,
      amount,
      ...overrides,
    };
  }

  /**
   * Generate multiple tax rates
   */
  static createTaxRates(count: number, overrides?: Partial<TaxRate>): TaxRate[] {
    return Array.from({ length: count }, () => this.createTaxRate(overrides));
  }

  /**
   * Generate tax rates for specific countries
   */
  static createTaxRatesForCountries(countries: string[]): TaxRate[] {
    return countries.map((country) =>
      this.createTaxRate({
        country,
        name: `${country} Tax`,
        rate: this.getDefaultRateForCountry(country),
        isActive: true,
      })
    );
  }

  /**
   * Generate a complete tax calculation with breakdown
   */
  static createDetailedTaxCalculation(subtotal: number, country: string): TaxCalculation {
    const rate = this.getDefaultRateForCountry(country);
    const taxAmount = (subtotal * rate) / 100;

    const breakdown: TaxBreakdown[] = [
      {
        name: `${country} Tax`,
        rate,
        amount: taxAmount,
      },
    ];

    return {
      taxAmount,
      taxRate: rate,
      breakdown,
    };
  }

  /**
   * Get default tax rate for a country
   */
  static getDefaultRateForCountry(country: string): number {
    const rates: Record<string, number> = {
      US: 8.5,
      CA: 13,
      GB: 20,
      FR: 20,
      DE: 19,
      AU: 10,
      JP: 10,
      BR: 17,
      IN: 18,
      CN: 13,
    };

    return rates[country] || faker.number.float({ min: 5, max: 25, fractionDigits: 1 });
  }

  /**
   * Generate a US state tax rate
   */
  static createUSStateTaxRate(state: string, overrides?: Partial<TaxRate>): TaxRate {
    return this.createTaxRate({
      country: 'US',
      region: state,
      name: `${state} Sales Tax`,
      rate: faker.number.float({ min: 4, max: 10, fractionDigits: 2 }),
      isActive: true,
      ...overrides,
    });
  }

  /**
   * Generate a Canada province tax rate
   */
  static createCanadaProvinceTaxRate(province: string, overrides?: Partial<TaxRate>): TaxRate {
    return this.createTaxRate({
      country: 'CA',
      region: province,
      name: `${province} HST/GST`,
      rate: faker.number.float({ min: 5, max: 15, fractionDigits: 2 }),
      isActive: true,
      ...overrides,
    });
  }

  /**
   * Generate a VAT rate (EU)
   */
  static createVATRate(country: string, overrides?: Partial<TaxRate>): TaxRate {
    return this.createTaxRate({
      country,
      name: `${country} VAT`,
      rate: faker.number.float({ min: 17, max: 27, fractionDigits: 1 }),
      isActive: true,
      ...overrides,
    });
  }

  /**
   * Generate a compound tax calculation
   */
  static createCompoundTaxCalculation(subtotal: number): TaxCalculation {
    const federalRate = 5;
    const stateRate = 8;

    const federalTax = (subtotal * federalRate) / 100;
    const stateTaxBase = subtotal + federalTax; // Compound
    const stateTax = (stateTaxBase * stateRate) / 100;

    const totalTax = federalTax + stateTax;
    const totalRate = (totalTax / subtotal) * 100;

    return {
      taxAmount: totalTax,
      taxRate: totalRate,
      breakdown: [
        { name: 'Federal Tax', rate: federalRate, amount: federalTax },
        { name: 'State Tax (Compound)', rate: stateRate, amount: stateTax },
      ],
    };
  }
}
