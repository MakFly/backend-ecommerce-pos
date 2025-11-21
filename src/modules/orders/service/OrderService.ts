import { Order, OrderItem } from '../domain/Order.js';
import { Money } from '@modules/products/domain/Money.js';
import { NotFoundError } from '@shared/errors/AppError.js';

export class OrderService {
  async createOrder(input: {
    customerId?: string;
    email: string;
    items: Array<{
      variantId: string;
      title: string;
      sku: string;
      quantity: number;
      price: number;
    }>;
    shippingAddress?: any;
    billingAddress?: any;
  }): Promise<Order> {
    const items: OrderItem[] = input.items.map((item) => ({
      id: `item-${Date.now()}-${Math.random()}`,
      variantId: item.variantId,
      title: item.title,
      sku: item.sku,
      quantity: item.quantity,
      price: Money.create(item.price, 'USD'),
      discountAmount: Money.create(0, 'USD'),
      taxAmount: Money.create(0, 'USD'),
      total: Money.create(item.price * item.quantity, 'USD'),
    }));

    const subtotal = items.reduce(
      (sum, item) => sum.add(item.total),
      Money.create(0, 'USD')
    );

    const order = Order.create({
      customerId: input.customerId,
      email: input.email,
      financialStatus: 'unpaid',
      fulfillmentStatus: 'unfulfilled',
      items,
      subtotal,
      taxTotal: Money.create(0, 'USD'),
      shippingTotal: Money.create(0, 'USD'),
      discountTotal: Money.create(0, 'USD'),
      total: subtotal,
      shippingAddress: input.shippingAddress,
      billingAddress: input.billingAddress,
    });

    return order;
  }

  async processPayment(orderId: string): Promise<void> {
    // Payment processing logic here
    throw new Error('Not implemented');
  }
}
