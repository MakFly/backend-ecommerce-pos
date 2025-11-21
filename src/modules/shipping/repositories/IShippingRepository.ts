import { ShippingZone, ShippingRate } from '../models/Shipping.js';

/**
 * Shipping Repository Interface
 *
 * SOLID Principles:
 * - Interface Segregation: Focused on shipping data access
 * - Dependency Inversion: Services depend on this abstraction
 */
export interface IShippingZoneRepository {
  findById(id: string): Promise<ShippingZone | null>;
  findAll(filters?: { isActive?: boolean }): Promise<ShippingZone[]>;
  findByCountry(country: string): Promise<ShippingZone[]>;
  save(zone: ShippingZone): Promise<void>;
}

export interface IShippingRateRepository {
  findById(id: string): Promise<ShippingRate | null>;
  findByZone(zoneId: string): Promise<ShippingRate[]>;
  findAll(filters?: { isActive?: boolean }): Promise<ShippingRate[]>;
  save(rate: ShippingRate): Promise<void>;
}
