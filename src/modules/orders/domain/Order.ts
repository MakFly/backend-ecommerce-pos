import { AggregateRoot } from '@core/domain/AggregateRoot.js';
import { Money } from '@modules/products/domain/Money.js';

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'partially_refunded';
export type FulfillmentStatus = 'unfulfilled' | 'fulfilled' | 'partially_fulfilled';

export interface OrderItem {
  id: string;
  variantId: string;
  title: string;
  sku: string;
  quantity: number;
  price: Money;
  discountAmount: Money;
  taxAmount: Money;
  total: Money;
}

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone?: string;
}

interface OrderProps {
  orderNumber: string;
  customerId?: string;
  email: string;
  status: OrderStatus;
  financialStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  items: OrderItem[];
  subtotal: Money;
  taxTotal: Money;
  shippingTotal: Money;
  discountTotal: Money;
  total: Money;
  shippingAddress?: Address;
  billingAddress?: Address;
  metadata?: Record<string, unknown>;
}

export class Order extends AggregateRoot<OrderProps> {
  private constructor(private props: OrderProps, id?: string) {
    super(props, id);
  }

  static create(props: Omit<OrderProps, 'orderNumber' | 'status'>): Order {
    return new Order({
      ...props,
      orderNumber: `ORD-${Date.now()}`,
      status: 'pending',
    });
  }

  static reconstitute(props: OrderProps, id: string): Order {
    return new Order(props, id);
  }

  get orderNumber(): string {
    return this.props.orderNumber;
  }

  get customerId(): string | undefined {
    return this.props.customerId;
  }

  get email(): string {
    return this.props.email;
  }

  get status(): OrderStatus {
    return this.props.status;
  }

  get financialStatus(): PaymentStatus {
    return this.props.financialStatus;
  }

  get fulfillmentStatus(): FulfillmentStatus {
    return this.props.fulfillmentStatus;
  }

  get items(): ReadonlyArray<OrderItem> {
    return this.props.items;
  }

  get subtotal(): Money {
    return this.props.subtotal;
  }

  get total(): Money {
    return this.props.total;
  }

  markAsPaid(): void {
    this.props.financialStatus = 'paid';
    this.touch();
  }

  markAsFulfilled(): void {
    this.props.fulfillmentStatus = 'fulfilled';
    this.props.status = 'completed';
    this.touch();
  }

  cancel(): void {
    this.props.status = 'cancelled';
    this.touch();
  }
}
