import { IShippingZoneRepository, IShippingRateRepository } from './IShippingRepository.js';
import { ShippingZone, ShippingRate } from '../models/Shipping.js';
import { IDatabase } from '@shared/interfaces/IDatabase.js';

/**
 * Shipping Zone Repository
 */
export class ShippingZoneRepository implements IShippingZoneRepository {
  constructor(private readonly db: IDatabase) {}

  async findById(id: string): Promise<ShippingZone | null> {
    const rows = await this.db.query<any>(
      `SELECT * FROM shipping_zones WHERE id = $1`,
      [id]
    );
    return rows.length > 0 ? this.mapToZone(rows[0]) : null;
  }

  async findAll(filters?: { isActive?: boolean }): Promise<ShippingZone[]> {
    let query = `SELECT * FROM shipping_zones`;
    const params: any[] = [];

    if (filters?.isActive !== undefined) {
      query += ` WHERE is_active = $1`;
      params.push(filters.isActive);
    }

    const rows = await this.db.query<any>(query, params);
    return rows.map(this.mapToZone);
  }

  async findByCountry(country: string): Promise<ShippingZone[]> {
    const rows = await this.db.query<any>(
      `SELECT * FROM shipping_zones WHERE $1 = ANY(countries)`,
      [country]
    );
    return rows.map(this.mapToZone);
  }

  async save(zone: ShippingZone): Promise<void> {
    await this.db.execute(
      `INSERT INTO shipping_zones (id, name, countries, regions, is_active)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET
         name = $2, countries = $3, regions = $4, is_active = $5`,
      [zone.id, zone.name, zone.countries, zone.regions, zone.isActive]
    );
  }

  private mapToZone(row: any): ShippingZone {
    return {
      id: row.id,
      name: row.name,
      countries: row.countries,
      regions: row.regions,
      isActive: row.is_active,
    };
  }
}

/**
 * Shipping Rate Repository
 */
export class ShippingRateRepository implements IShippingRateRepository {
  constructor(private readonly db: IDatabase) {}

  async findById(id: string): Promise<ShippingRate | null> {
    const rows = await this.db.query<any>(
      `SELECT * FROM shipping_rates WHERE id = $1`,
      [id]
    );
    return rows.length > 0 ? this.mapToRate(rows[0]) : null;
  }

  async findByZone(zoneId: string): Promise<ShippingRate[]> {
    const rows = await this.db.query<any>(
      `SELECT * FROM shipping_rates WHERE zone_id = $1 AND is_active = true`,
      [zoneId]
    );
    return rows.map(this.mapToRate);
  }

  async findAll(filters?: { isActive?: boolean }): Promise<ShippingRate[]> {
    let query = `SELECT * FROM shipping_rates`;
    const params: any[] = [];

    if (filters?.isActive !== undefined) {
      query += ` WHERE is_active = $1`;
      params.push(filters.isActive);
    }

    const rows = await this.db.query<any>(query, params);
    return rows.map(this.mapToRate);
  }

  async save(rate: ShippingRate): Promise<void> {
    await this.db.execute(
      `INSERT INTO shipping_rates (
        id, zone_id, name, price, min_order_value, max_order_value,
        min_weight, max_weight, delivery_time, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE SET
        zone_id = $2, name = $3, price = $4, min_order_value = $5,
        max_order_value = $6, min_weight = $7, max_weight = $8,
        delivery_time = $9, is_active = $10`,
      [
        rate.id,
        rate.zoneId,
        rate.name,
        rate.price,
        rate.minOrderValue,
        rate.maxOrderValue,
        rate.minWeight,
        rate.maxWeight,
        rate.deliveryTime,
        rate.isActive,
      ]
    );
  }

  private mapToRate(row: any): ShippingRate {
    return {
      id: row.id,
      zoneId: row.zone_id,
      name: row.name,
      price: parseFloat(row.price),
      minOrderValue: row.min_order_value ? parseFloat(row.min_order_value) : undefined,
      maxOrderValue: row.max_order_value ? parseFloat(row.max_order_value) : undefined,
      minWeight: row.min_weight ? parseFloat(row.min_weight) : undefined,
      maxWeight: row.max_weight ? parseFloat(row.max_weight) : undefined,
      deliveryTime: row.delivery_time,
      isActive: row.is_active,
    };
  }
}
