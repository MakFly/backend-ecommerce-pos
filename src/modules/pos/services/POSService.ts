import { nanoid } from 'nanoid';
import {
  POSSession,
  POSSale,
  OpenSessionDto,
  CloseSessionDto,
  CreatePOSSaleDto,
  POSSaleItem,
} from '../models/POS.js';

export class POSService {
  async openSession(dto: OpenSessionDto): Promise<POSSession> {
    const session: POSSession = {
      id: nanoid(),
      sessionNumber: this.generateSessionNumber(),
      userId: dto.userId,
      warehouseId: dto.warehouseId,
      status: 'open',
      openingCash: dto.openingCash,
      openedAt: new Date(),
      metadata: {},
    };

    // Save to DB (TODO: add repository)
    return session;
  }

  async closeSession(sessionId: string, dto: CloseSessionDto): Promise<POSSession> {
    // Get session from DB
    const session: POSSession = {
      id: sessionId,
      sessionNumber: 'POS-123',
      userId: 'user-1',
      warehouseId: 'warehouse-1',
      status: 'closed',
      openingCash: 100,
      closingCash: dto.closingCash,
      expectedCash: 500,
      difference: dto.closingCash - 500,
      openedAt: new Date(),
      closedAt: new Date(),
    };

    return session;
  }

  async createSale(dto: CreatePOSSaleDto): Promise<POSSale> {
    const items: POSSaleItem[] = dto.items.map((item) => ({
      id: nanoid(),
      saleId: '',
      variantId: item.variantId,
      title: '', // TODO: Get from variant
      sku: '', // TODO: Get from variant
      quantity: item.quantity,
      price: item.price,
      discountAmount: 0,
      total: item.price * item.quantity,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);

    const sale: POSSale = {
      id: nanoid(),
      saleNumber: this.generateSaleNumber(),
      sessionId: dto.sessionId,
      customerId: dto.customerId,
      items: items.map((item) => ({ ...item, saleId: '' })),
      subtotal,
      taxTotal: 0,
      discountTotal: 0,
      total: subtotal,
      paymentMethod: dto.paymentMethod,
      amountPaid: dto.amountPaid,
      change: dto.amountPaid - subtotal,
      metadata: {},
      createdAt: new Date(),
    };

    sale.items = sale.items.map((item) => ({ ...item, saleId: sale.id }));

    return sale;
  }

  private generateSessionNumber(): string {
    const timestamp = Date.now().toString().slice(-8);
    return `POS-${timestamp}`;
  }

  private generateSaleNumber(): string {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `SALE-${timestamp}-${random}`;
  }
}
