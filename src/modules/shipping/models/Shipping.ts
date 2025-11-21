export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  regions?: string[];
  isActive: boolean;
}

export interface ShippingRate {
  id: string;
  zoneId: string;
  name: string;
  description?: string;
  type: 'fixed' | 'weight_based' | 'price_based';
  price: number;
  minWeight?: number;
  maxWeight?: number;
  minPrice?: number;
  maxPrice?: number;
  deliveryTime?: string;
}

export interface ShippingQuoteDto {
  destinationCountry: string;
  destinationRegion?: string;
  weight?: number;
  orderTotal?: number;
}

export interface ShippingQuote {
  rateId: string;
  name: string;
  price: number;
  deliveryTime?: string;
}
