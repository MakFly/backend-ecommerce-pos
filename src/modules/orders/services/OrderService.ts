import { nanoid } from 'nanoid';
import { IOrderRepository } from '../repositories/IOrderRepository.js';
import { Order, CreateOrderDto, UpdateOrderDto, OrderItem } from '../models/Order.js';
import { ICrudService } from '@shared/interfaces/IService.js';

/**
 * Order Service
 *
 * SOLID:
 * - SRP: Business logic for orders only
 * - DIP: Depends on IOrderRepository interface
 */
export class OrderService implements ICrudService<Order, CreateOrderDto, UpdateOrderDto> {
  constructor(private readonly repository: IOrderRepository) {}

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    // Calculate totals
    const items: OrderItem[] = dto.items.map((item) => ({
      id: nanoid(),
      orderId: '', // Will be set after order creation
      variantId: item.variantId,
      productId: '', // TODO: Get from variant
      title: '', // TODO: Get from variant
      sku: '', // TODO: Get from variant
      quantity: item.quantity,
      price: item.price,
      discountAmount: 0,
      taxAmount: 0,
      total: item.price * item.quantity,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);

    const order: Order = {
      id: nanoid(),
      orderNumber: this.generateOrderNumber(),
      customerId: dto.customerId,
      email: dto.email,
      status: 'pending',
      financialStatus: 'unpaid',
      fulfillmentStatus: 'unfulfilled',
      items: items.map((item) => ({ ...item, orderId: '' })),
      subtotal,
      taxTotal: 0, // TODO: Calculate tax
      shippingTotal: 0, // TODO: Calculate shipping
      discountTotal: 0,
      total: subtotal,
      currency: 'USD',
      shippingAddress: dto.shippingAddress,
      billingAddress: dto.billingAddress,
      notes: dto.notes,
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Update item orderIds
    order.items = order.items.map((item) => ({ ...item, orderId: order.id }));

    await this.repository.save(order);
    return order;
  }

  async getOrder(id: string): Promise<Order> {
    const order = await this.repository.findById(id);
    if (!order) {
      throw new Error(`Order with id ${id} not found`);
    }
    return order;
  }

  async updateOrder(id: string, dto: UpdateOrderDto): Promise<Order> {
    const order = await this.getOrder(id);

    const updated: Order = {
      ...order,
      ...dto,
      updatedAt: new Date(),
    };

    await this.repository.update(id, updated);
    return this.getOrder(id);
  }

  async cancelOrder(id: string): Promise<Order> {
    return this.updateOrder(id, { status: 'cancelled' });
  }

  async markAsPaid(id: string): Promise<Order> {
    return this.updateOrder(id, { financialStatus: 'paid' });
  }

  async markAsFulfilled(id: string): Promise<Order> {
    return this.updateOrder(id, {
      fulfillmentStatus: 'fulfilled',
      status: 'completed',
    });
  }

  async listOrders(options?: { limit?: number; offset?: number }): Promise<Order[]> {
    return this.repository.findAll(options);
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    return this.repository.findByCustomerId(customerId);
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }

  // Alias methods for ICrudService
  create = this.createOrder;
  getById = this.getOrder;
  getAll = this.listOrders;
  update = this.updateOrder;
  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
