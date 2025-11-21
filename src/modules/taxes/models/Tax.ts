export interface TaxRate {
  id: string;
  name: string;
  country: string;
  region?: string;
  rate: number; // Percentage (e.g., 20 for 20%)
  isCompound: boolean;
  priority: number;
  isActive: boolean;
}

export interface TaxCalculationDto {
  country: string;
  region?: string;
  subtotal: number;
  shippingCost?: number;
}

export interface TaxCalculation {
  taxAmount: number;
  taxRate: number;
  breakdown: TaxBreakdown[];
}

export interface TaxBreakdown {
  name: string;
  rate: number;
  amount: number;
}
