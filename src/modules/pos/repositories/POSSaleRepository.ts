import { IPOSSaleRepository } from './IPOSRepository.js';
import { POSSale } from '../models/POS.js';
import { IDatabase } from '@shared/interfaces/IDatabase.js';

/**
 * POS Sale Repository
 *
 * SOLID Principles:
 * - Single Responsibility: POS sale data access only
 * - Dependency Inversion: Depends on IDatabase abstraction
 */
export class POSSaleRepository implements IPOSSaleRepository {
  constructor(private readonly db: IDatabase) {}

  async findById(id: string): Promise<POSSale | null> {
    const rows = await this.db.query<any>(
      `SELECT s.*,
        json_agg(
          DISTINCT jsonb_build_object(
            'id', si.id,
            'saleId', si.sale_id,
            'productId', si.product_id,
            'variantId', si.variant_id,
            'quantity', si.quantity,
            'price', si.price,
            'discount', si.discount,
            'total', si.total,
            'sku', si.sku,
            'title', si.title
          )
        ) FILTER (WHERE si.id IS NOT NULL) as items,
        json_agg(
          DISTINCT jsonb_build_object(
            'id', sp.id,
            'method', sp.method,
            'amount', sp.amount,
            'reference', sp.reference,
            'metadata', sp.metadata
          )
        ) FILTER (WHERE sp.id IS NOT NULL) as payments
       FROM pos_sales s
       LEFT JOIN pos_sale_items si ON s.id = si.sale_id
       LEFT JOIN pos_sale_payments sp ON s.id = sp.sale_id
       WHERE s.id = $1
       GROUP BY s.id`,
      [id]
    );

    if (rows.length === 0) return null;

    return this.mapToPOSSale(rows[0]);
  }

  async findBySession(sessionId: string, limit?: number): Promise<POSSale[]> {
    const rows = await this.db.query<any>(
      `SELECT s.*,
        json_agg(
          DISTINCT jsonb_build_object(
            'id', si.id,
            'saleId', si.sale_id,
            'productId', si.product_id,
            'variantId', si.variant_id,
            'quantity', si.quantity,
            'price', si.price,
            'discount', si.discount,
            'total', si.total,
            'sku', si.sku,
            'title', si.title
          )
        ) FILTER (WHERE si.id IS NOT NULL) as items,
        json_agg(
          DISTINCT jsonb_build_object(
            'id', sp.id,
            'method', sp.method,
            'amount', sp.amount,
            'reference', sp.reference,
            'metadata', sp.metadata
          )
        ) FILTER (WHERE sp.id IS NOT NULL) as payments
       FROM pos_sales s
       LEFT JOIN pos_sale_items si ON s.id = si.sale_id
       LEFT JOIN pos_sale_payments sp ON s.id = sp.sale_id
       WHERE s.session_id = $1
       GROUP BY s.id
       ORDER BY s.created_at DESC
       LIMIT $2`,
      [sessionId, limit || 100]
    );

    return rows.map(this.mapToPOSSale);
  }

  async save(sale: POSSale): Promise<void> {
    // Begin transaction
    await this.db.execute('BEGIN');

    try {
      // Insert sale
      await this.db.execute(
        `INSERT INTO pos_sales (
          id, sale_number, session_id, customer_id, subtotal, tax, discount,
          total, status, metadata, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          sale.id,
          sale.saleNumber,
          sale.sessionId,
          sale.customerId,
          sale.subtotal,
          sale.tax,
          sale.discount,
          sale.total,
          sale.status,
          JSON.stringify(sale.metadata),
          sale.createdAt,
        ]
      );

      // Insert sale items
      for (const item of sale.items) {
        await this.db.execute(
          `INSERT INTO pos_sale_items (
            id, sale_id, product_id, variant_id, quantity, price, discount, total, sku, title
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            item.id,
            sale.id,
            item.productId,
            item.variantId,
            item.quantity,
            item.price,
            item.discount,
            item.total,
            item.sku,
            item.title,
          ]
        );
      }

      // Insert payments
      for (const payment of sale.payments) {
        await this.db.execute(
          `INSERT INTO pos_sale_payments (
            id, sale_id, method, amount, reference, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            payment.id,
            sale.id,
            payment.method,
            payment.amount,
            payment.reference,
            JSON.stringify(payment.metadata),
          ]
        );
      }

      await this.db.execute('COMMIT');
    } catch (error) {
      await this.db.execute('ROLLBACK');
      throw error;
    }
  }

  private mapToPOSSale(row: any): POSSale {
    return {
      id: row.id,
      saleNumber: row.sale_number,
      sessionId: row.session_id,
      customerId: row.customer_id,
      items: row.items || [],
      subtotal: parseFloat(row.subtotal),
      tax: parseFloat(row.tax),
      discount: parseFloat(row.discount),
      total: parseFloat(row.total),
      payments: row.payments || [],
      status: row.status,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
      createdAt: row.created_at,
    };
  }
}
