import { faker } from '@faker-js/faker';
import {
  Order,
  OrderItem,
  Cart,
  Address,
  CreateOrderDto,
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus,
} from '@modules/orders/models/Order.js';

/**
 * Data Factory for Orders
 *
 * SOLID Principles:
 * - Single Responsibility: Generate fake order data only
 * - Open/Closed: Easy to extend with new methods
 *
 * Usage:
 * - Tests: Create fake orders for testing
 * - Seeding: Populate database with sample data
 */
export class OrderFactory {
  /**
   * Generate a fake order
   */
  static createOrder(overrides?: Partial<Order>): Order {
    const subtotal = faker.number.float({ min: 50, max: 500, fractionDigits: 2 });
    const tax = subtotal * 0.1;
    const shipping = faker.number.float({ min: 5, max: 20, fractionDigits: 2 });
    const total = subtotal + tax + shipping;

    return {
      id: faker.string.nanoid(),
      orderNumber: `ORD-${faker.string.numeric(8)}`,
      status: faker.helpers.arrayElement([
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
      ] as OrderStatus[]),
      financialStatus: faker.helpers.arrayElement([
        'pending',
        'paid',
        'partially_paid',
        'refunded',
        'voided',
      ] as PaymentStatus[]),
      fulfillmentStatus: faker.helpers.arrayElement([
        'unfulfilled',
        'partially_fulfilled',
        'fulfilled',
        'cancelled',
      ] as FulfillmentStatus[]),
      customerId: faker.string.nanoid(),
      items: [],
      subtotal,
      tax,
      shipping,
      discount: 0,
      total,
      currency: 'USD',
      shippingAddress: this.createAddress(),
      billingAddress: this.createAddress(),
      paymentMethod: faker.helpers.arrayElement(['credit_card', 'debit_card', 'paypal', 'bank_transfer']),
      shippingMethod: faker.helpers.arrayElement(['standard', 'express', 'overnight']),
      notes: faker.lorem.sentence(),
      metadata: {},
      createdAt: faker.date.past(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  /**
   * Generate a fake order item
   */
  static createOrderItem(overrides?: Partial<OrderItem>): OrderItem {
    const quantity = faker.number.int({ min: 1, max: 5 });
    const price = faker.number.float({ min: 10, max: 200, fractionDigits: 2 });
    const total = quantity * price;

    return {
      id: faker.string.nanoid(),
      orderId: faker.string.nanoid(),
      productId: faker.string.nanoid(),
      variantId: faker.string.nanoid(),
      quantity,
      price,
      total,
      sku: faker.string.alphanumeric(10).toUpperCase(),
      title: faker.commerce.productName(),
      variantTitle: faker.commerce.productAdjective(),
      metadata: {},
      ...overrides,
    };
  }

  /**
   * Generate a fake address
   */
  static createAddress(overrides?: Partial<Address>): Address {
    return {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      company: faker.company.name(),
      address1: faker.location.streetAddress(),
      address2: faker.location.secondaryAddress(),
      city: faker.location.city(),
      region: faker.location.state(),
      postalCode: faker.location.zipCode(),
      country: faker.location.countryCode(),
      phone: faker.phone.number(),
      ...overrides,
    };
  }

  /**
   * Generate a fake cart
   */
  static createCart(overrides?: Partial<Cart>): Cart {
    const items = this.createOrderItems(faker.number.int({ min: 1, max: 5 }));
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);

    return {
      id: faker.string.nanoid(),
      customerId: faker.string.nanoid(),
      items,
      subtotal,
      currency: 'USD',
      metadata: {},
      createdAt: faker.date.past(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  /**
   * Generate a CreateOrderDto for testing
   */
  static createOrderDto(overrides?: Partial<CreateOrderDto>): CreateOrderDto {
    return {
      customerId: faker.string.nanoid(),
      items: this.createOrderItems(faker.number.int({ min: 1, max: 3 })).map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
      })),
      shippingAddress: this.createAddress(),
      billingAddress: this.createAddress(),
      paymentMethod: faker.helpers.arrayElement(['credit_card', 'debit_card', 'paypal']),
      shippingMethod: faker.helpers.arrayElement(['standard', 'express']),
      notes: faker.lorem.sentence(),
      ...overrides,
    };
  }

  /**
   * Generate multiple orders
   */
  static createOrders(count: number, overrides?: Partial<Order>): Order[] {
    return Array.from({ length: count }, () => this.createOrder(overrides));
  }

  /**
   * Generate multiple order items
   */
  static createOrderItems(count: number, orderId?: string): OrderItem[] {
    return Array.from({ length: count }, () =>
      this.createOrderItem(orderId ? { orderId } : {})
    );
  }

  /**
   * Generate a complete order with items
   */
  static createOrderWithItems(itemCount: number = 3): {
    order: Order;
    items: OrderItem[];
  } {
    const order = this.createOrder({ status: 'confirmed', financialStatus: 'paid' });
    const items = this.createOrderItems(itemCount, order.id);

    // Recalculate order totals based on items
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax + order.shipping;

    order.items = items;
    order.subtotal = subtotal;
    order.tax = tax;
    order.total = total;

    return { order, items };
  }
}
