import { IOrderRepository } from './IOrderRepository.js';
import { Order } from '../models/Order.js';
import { IDatabase } from '@shared/interfaces/IDatabase.js';
import { FindOptions } from '@shared/interfaces/IRepository.js';

export class OrderRepository implements IOrderRepository {
  constructor(private readonly db: IDatabase) {}

  async findById(id: string): Promise<Order | null> {
    const rows = await this.db.query<any>(
      `SELECT o.*,
        json_agg(
          json_build_object(
            'id', oi.id,
            'variantId', oi.variant_id,
            'productId', oi.product_id,
            'title', oi.title,
            'sku', oi.sku,
            'quantity', oi.quantity,
            'price', oi.price,
            'discountAmount', oi.discount_amount,
            'taxAmount', oi.tax_amount,
            'total', oi.total
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = $1
      GROUP BY o.id`,
      [id]
    );

    if (!rows[0]) return null;
    return this.mapToOrder(rows[0]);
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    const rows = await this.db.query<any>(
      `SELECT o.*,
        json_agg(
          json_build_object(
            'id', oi.id,
            'variantId', oi.variant_id,
            'productId', oi.product_id,
            'title', oi.title,
            'sku', oi.sku,
            'quantity', oi.quantity,
            'price', oi.price,
            'discountAmount', oi.discount_amount,
            'taxAmount', oi.tax_amount,
            'total', oi.total
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.order_number = $1
      GROUP BY o.id`,
      [orderNumber]
    );

    if (!rows[0]) return null;
    return this.mapToOrder(rows[0]);
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    const rows = await this.db.query<any>(
      `SELECT o.*,
        json_agg(
          json_build_object(
            'id', oi.id,
            'variantId', oi.variant_id,
            'productId', oi.product_id,
            'title', oi.title,
            'sku', oi.sku,
            'quantity', oi.quantity,
            'price', oi.price,
            'discountAmount', oi.discount_amount,
            'taxAmount', oi.tax_amount,
            'total', oi.total
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.customer_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC`,
      [customerId]
    );

    return rows.map(this.mapToOrder);
  }

  async findByEmail(email: string): Promise<Order[]> {
    const rows = await this.db.query<any>(
      `SELECT o.*,
        json_agg(
          json_build_object(
            'id', oi.id,
            'variantId', oi.variant_id,
            'productId', oi.product_id,
            'title', oi.title,
            'sku', oi.sku,
            'quantity', oi.quantity,
            'price', oi.price,
            'discountAmount', oi.discount_amount,
            'taxAmount', oi.tax_amount,
            'total', oi.total
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.email = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC`,
      [email]
    );

    return rows.map(this.mapToOrder);
  }

  async findAll(options?: FindOptions): Promise<Order[]> {
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;

    const rows = await this.db.query<any>(
      `SELECT o.*,
        json_agg(
          json_build_object(
            'id', oi.id,
            'variantId', oi.variant_id,
            'productId', oi.product_id,
            'title', oi.title,
            'sku', oi.sku,
            'quantity', oi.quantity,
            'price', oi.price,
            'discountAmount', oi.discount_amount,
            'taxAmount', oi.tax_amount,
            'total', oi.total
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return rows.map(this.mapToOrder);
  }

  async findBy(criteria: Record<string, unknown>): Promise<Order[]> {
    return this.findAll();
  }

  async count(): Promise<number> {
    const rows = await this.db.query<{ count: string }>(
      'SELECT COUNT(*) as count FROM orders'
    );
    return parseInt(rows[0].count, 10);
  }

  async save(order: Order): Promise<void> {
    await this.db.execute(
      `INSERT INTO orders (
        id, order_number, customer_id, email, status, financial_status, fulfillment_status,
        subtotal, tax_total, shipping_total, discount_total, total, currency,
        shipping_address, billing_address, notes, metadata, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        financial_status = EXCLUDED.financial_status,
        fulfillment_status = EXCLUDED.fulfillment_status,
        notes = EXCLUDED.notes,
        updated_at = EXCLUDED.updated_at`,
      [
        order.id,
        order.orderNumber,
        order.customerId || null,
        order.email,
        order.status,
        order.financialStatus,
        order.fulfillmentStatus,
        order.subtotal,
        order.taxTotal,
        order.shippingTotal,
        order.discountTotal,
        order.total,
        order.currency,
        JSON.stringify(order.shippingAddress || null),
        JSON.stringify(order.billingAddress || null),
        order.notes || null,
        JSON.stringify(order.metadata || {}),
        order.createdAt,
        order.updatedAt,
      ]
    );

    // Save order items
    for (const item of order.items) {
      await this.db.execute(
        `INSERT INTO order_items (
          id, order_id, variant_id, product_id, title, sku, quantity, price,
          discount_amount, tax_amount, total, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO NOTHING`,
        [
          item.id,
          order.id,
          item.variantId,
          item.productId,
          item.title,
          item.sku,
          item.quantity,
          item.price,
          item.discountAmount,
          item.taxAmount,
          item.total,
          JSON.stringify(item.metadata || {}),
        ]
      );
    }
  }

  async update(id: string, order: Partial<Order>): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (order.status !== undefined) {
      fields.push(`status = $${paramIndex++}`);
      values.push(order.status);
    }
    if (order.financialStatus !== undefined) {
      fields.push(`financial_status = $${paramIndex++}`);
      values.push(order.financialStatus);
    }
    if (order.fulfillmentStatus !== undefined) {
      fields.push(`fulfillment_status = $${paramIndex++}`);
      values.push(order.fulfillmentStatus);
    }
    if (order.notes !== undefined) {
      fields.push(`notes = $${paramIndex++}`);
      values.push(order.notes);
    }

    fields.push(`updated_at = $${paramIndex++}`);
    values.push(new Date());
    values.push(id);

    await this.db.execute(
      `UPDATE orders SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
      values
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.execute('DELETE FROM orders WHERE id = $1', [id]);
  }

  private mapToOrder(row: any): Order {
    return {
      id: row.id,
      orderNumber: row.order_number,
      customerId: row.customer_id,
      email: row.email,
      status: row.status,
      financialStatus: row.financial_status,
      fulfillmentStatus: row.fulfillment_status,
      items: row.items || [],
      subtotal: parseFloat(row.subtotal),
      taxTotal: parseFloat(row.tax_total),
      shippingTotal: parseFloat(row.shipping_total),
      discountTotal: parseFloat(row.discount_total),
      total: parseFloat(row.total),
      currency: row.currency,
      shippingAddress: row.shipping_address,
      billingAddress: row.billing_address,
      notes: row.notes,
      metadata: row.metadata,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
