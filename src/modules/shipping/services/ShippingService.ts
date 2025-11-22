import { ShippingQuoteDto, ShippingQuote, ShippingRate, ShippingZone } from '../models/Shipping.js';
import { IShippingZoneRepository, IShippingRateRepository } from '../repositories/IShippingRepository.js';

/**
 * Shipping Service
 *
 * SOLID Principles:
 * - Single Responsibility: Shipping calculation only
 * - Dependency Inversion: Depends on repository abstractions
 */
export class ShippingService {
  constructor(
    private readonly zoneRepo: IShippingZoneRepository,
    private readonly rateRepo: IShippingRateRepository
  ) {}

  async calculateShipping(dto: ShippingQuoteDto): Promise<ShippingQuote[]> {
    // 1. Find zones that match destination country
    const zones = await this.zoneRepo.findByCountry(dto.destinationCountry);

    if (zones.length === 0) {
      // No zones found, return default/fallback shipping
      return [
        {
          rateId: 'default',
          name: 'International Shipping',
          price: 25.0,
          deliveryTime: '10-15 business days',
        },
      ];
    }

    // 2. Get rates for found zones
    const quotes: ShippingQuote[] = [];

    for (const zone of zones) {
      const rates = await this.rateRepo.findByZone(zone.id);

      for (const rate of rates) {
        // 3. Check if rate applies to this order
        if (rate.minOrderValue && dto.orderTotal < rate.minOrderValue) {
          continue;
        }
        if (rate.maxOrderValue && dto.orderTotal > rate.maxOrderValue) {
          continue;
        }
        if (rate.minWeight && dto.weight < rate.minWeight) {
          continue;
        }
        if (rate.maxWeight && dto.weight > rate.maxWeight) {
          continue;
        }

        // 4. Add to quotes
        quotes.push({
          rateId: rate.id,
          name: rate.name,
          price: rate.price,
          deliveryTime: rate.deliveryTime,
        });
      }
    }

    // 5. Sort by price (cheapest first)
    quotes.sort((a, b) => a.price - b.price);

    return quotes;
  }

  async getShippingRate(rateId: string): Promise<ShippingRate | null> {
    return this.rateRepo.findById(rateId);
  }

  async listZones(filters?: { isActive?: boolean }): Promise<ShippingZone[]> {
    return this.zoneRepo.findAll(filters);
  }

  async listRates(zoneId: string): Promise<ShippingRate[]> {
    return this.rateRepo.findByZone(zoneId);
  }
}
