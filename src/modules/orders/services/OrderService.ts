import { nanoid } from 'nanoid';
import { IOrderRepository } from '../repositories/IOrderRepository.js';
import { Order, CreateOrderDto, UpdateOrderDto, OrderItem } from '../models/Order.js';
import { ICrudService } from '@shared/interfaces/IService.js';
import { InventoryService } from '@modules/inventory/services/InventoryService.js';
import { TaxService } from '@modules/taxes/services/TaxService.js';
import { ShippingService } from '@modules/shipping/services/ShippingService.js';
import { PromotionService } from '@modules/promotions/services/PromotionService.js';

/**
 * Order Service with Inter-Module Integration
 *
 * SOLID:
 * - SRP: Business logic for orders only
 * - DIP: Depends on interfaces (repositories & services)
 * - OCP: Extensible with new services
 *
 * Integrations:
 * - InventoryService: Reserve stock when order is created
 * - TaxService: Calculate taxes based on address
 * - ShippingService: Calculate shipping costs
 * - PromotionService: Apply coupons and discounts
 */
export class OrderService implements ICrudService<Order, CreateOrderDto, UpdateOrderDto> {
  constructor(
    private readonly repository: IOrderRepository,
    private readonly inventoryService?: InventoryService,
    private readonly taxService?: TaxService,
    private readonly shippingService?: ShippingService,
    private readonly promotionService?: PromotionService
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    // 1. Calculate item totals
    const items: OrderItem[] = dto.items.map((item) => ({
      id: nanoid(),
      orderId: '',
      variantId: item.variantId,
      productId: item.productId,
      title: item.title || '',
      sku: item.sku || '',
      quantity: item.quantity,
      price: item.price,
      discountAmount: 0,
      taxAmount: 0,
      total: item.price * item.quantity,
    }));

    let subtotal = items.reduce((sum, item) => sum + item.total, 0);

    // 2. Apply promotions (coupons/discounts)
    let discountTotal = 0;
    if (this.promotionService && dto.couponCode) {
      try {
        const validation = await this.promotionService.validateCoupon({
          code: dto.couponCode,
          orderTotal: subtotal,
        });

        if (validation.valid && validation.discountAmount) {
          discountTotal = validation.discountAmount;
          subtotal -= discountTotal;
        }
      } catch (error) {
        console.warn('Failed to apply coupon:', error);
      }
    }

    // 3. Calculate shipping
    let shippingTotal = 0;
    if (this.shippingService && dto.shippingAddress) {
      try {
        const quotes = await this.shippingService.calculateShipping({
          destinationCountry: dto.shippingAddress.country,
          destinationRegion: dto.shippingAddress.region,
          orderTotal: subtotal,
          weight: 1.0, // TODO: Calculate real weight from items
        });

        if (quotes && quotes.length > 0) {
          shippingTotal = quotes[0].price; // Use first/cheapest option
        }
      } catch (error) {
        console.warn('Failed to calculate shipping:', error);
      }
    }

    // 4. Calculate taxes
    let taxTotal = 0;
    if (this.taxService && dto.shippingAddress) {
      try {
        const taxCalc = await this.taxService.calculateTax({
          country: dto.shippingAddress.country,
          region: dto.shippingAddress.region,
          amount: subtotal + shippingTotal,
        });

        taxTotal = taxCalc.taxAmount;
      } catch (error) {
        console.warn('Failed to calculate tax:', error);
      }
    }

    // 5. Calculate final total
    const total = subtotal + shippingTotal + taxTotal;

    // 6. Create order
    const order: Order = {
      id: nanoid(),
      orderNumber: this.generateOrderNumber(),
      customerId: dto.customerId,
      email: dto.email,
      status: 'pending',
      financialStatus: 'unpaid',
      fulfillmentStatus: 'unfulfilled',
      items: items.map((item) => ({ ...item, orderId: '' })),
      subtotal: subtotal + discountTotal, // Original subtotal before discount
      taxTotal,
      shippingTotal,
      discountTotal,
      total,
      currency: dto.currency || 'USD',
      shippingAddress: dto.shippingAddress,
      billingAddress: dto.billingAddress,
      paymentMethod: dto.paymentMethod,
      shippingMethod: dto.shippingMethod,
      notes: dto.notes,
      metadata: dto.couponCode ? { couponCode: dto.couponCode } : {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Update item orderIds
    order.items = order.items.map((item) => ({ ...item, orderId: order.id }));

    // 7. Reserve stock in inventory
    if (this.inventoryService) {
      for (const item of order.items) {
        try {
          await this.inventoryService.reserveStock({
            variantId: item.variantId,
            warehouseId: 'default-warehouse', // TODO: Get from config
            quantity: item.quantity,
            reference: order.orderNumber,
          });
        } catch (error) {
          console.error(`Failed to reserve stock for variant ${item.variantId}:`, error);
          // TODO: Handle stock reservation failure (rollback, notify, etc.)
        }
      }
    }

    // 8. Save order to database
    await this.repository.save(order);

    return order;
  }

  async findById(id: string): Promise<Order | null> {
    return this.repository.findById(id);
  }

  async listOrders(filters?: {
    customerId?: string;
    status?: string;
    limit?: number;
  }): Promise<Order[]> {
    return this.repository.findAll(filters);
  }

  async updateOrder(id: string, dto: UpdateOrderDto): Promise<Order> {
    const order = await this.repository.findById(id);

    if (!order) {
      throw new Error('Order not found');
    }

    const updates: Partial<Order> = {
      status: dto.status,
      financialStatus: dto.financialStatus,
      fulfillmentStatus: dto.fulfillmentStatus,
      notes: dto.notes,
      updatedAt: new Date(),
    };

    await this.repository.update(id, updates);

    return { ...order, ...updates } as Order;
  }

  async cancelOrder(id: string): Promise<Order> {
    const order = await this.repository.findById(id);

    if (!order) {
      throw new Error('Order not found');
    }

    // Release reserved stock
    if (this.inventoryService && order.fulfillmentStatus === 'unfulfilled') {
      for (const item of order.items) {
        try {
          await this.inventoryService.releaseStock({
            variantId: item.variantId,
            warehouseId: 'default-warehouse',
            quantity: item.quantity,
            reference: order.orderNumber,
          });
        } catch (error) {
          console.error(`Failed to release stock for variant ${item.variantId}:`, error);
        }
      }
    }

    const updates: Partial<Order> = {
      status: 'cancelled',
      fulfillmentStatus: 'cancelled',
      updatedAt: new Date(),
    };

    await this.repository.update(id, updates);

    return { ...order, ...updates } as Order;
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }
}
