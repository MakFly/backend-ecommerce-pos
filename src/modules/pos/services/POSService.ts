import { nanoid } from 'nanoid';
import {
  POSSession,
  POSSale,
  OpenSessionDto,
  CloseSessionDto,
  CreatePOSSaleDto,
  POSSaleItem,
  POSPayment,
} from '../models/POS.js';
import { IPOSSessionRepository, IPOSSaleRepository } from '../repositories/IPOSRepository.js';

/**
 * POS Service
 *
 * SOLID Principles:
 * - Single Responsibility: POS business logic only
 * - Dependency Inversion: Depends on repository abstractions
 */
export class POSService {
  constructor(
    private readonly sessionRepo: IPOSSessionRepository,
    private readonly saleRepo: IPOSSaleRepository
  ) {}

  // Session methods
  async listSessions(filters?: { status?: string; limit?: number }): Promise<POSSession[]> {
    return this.sessionRepo.findAll(filters);
  }

  async getSession(id: string): Promise<POSSession | null> {
    return this.sessionRepo.findById(id);
  }

  async openSession(dto: OpenSessionDto): Promise<POSSession> {
    const session: POSSession = {
      id: nanoid(),
      sessionNumber: this.generateSessionNumber(),
      locationId: dto.locationId,
      cashierId: dto.cashierId,
      status: 'open',
      openingCash: dto.openingCash,
      totalSales: 0,
      totalTransactions: 0,
      openedAt: new Date(),
      metadata: {},
    };

    await this.sessionRepo.save(session);
    return session;
  }

  async closeSession(sessionId: string, dto: CloseSessionDto): Promise<POSSession> {
    const session = await this.sessionRepo.findById(sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    if (session.status !== 'open') {
      throw new Error('Session is not open');
    }

    // Update session
    const updates: Partial<POSSession> = {
      status: 'closed',
      closingCash: dto.closingCash,
      expectedCash: session.openingCash + session.totalSales,
      closedAt: new Date(),
    };

    await this.sessionRepo.update(sessionId, updates);

    // Return updated session
    return { ...session, ...updates } as POSSession;
  }

  // Sale methods
  async listSales(filters?: { sessionId: string; limit?: number }): Promise<POSSale[]> {
    if (!filters?.sessionId) {
      throw new Error('sessionId is required');
    }

    return this.saleRepo.findBySession(filters.sessionId, filters.limit);
  }

  async getSale(id: string): Promise<POSSale | null> {
    return this.saleRepo.findById(id);
  }

  async createSale(dto: CreatePOSSaleDto): Promise<POSSale> {
    // Calculate items
    const items: POSSaleItem[] = dto.items.map((item) => ({
      id: nanoid(),
      saleId: '', // Will be set below
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      price: item.price,
      discount: item.discount || 0,
      total: item.price * item.quantity - (item.discount || 0),
      sku: item.sku,
      title: item.title,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.1; // TODO: Calculate real tax
    const discount = 0; // TODO: Apply discounts
    const total = subtotal + tax - discount;

    // Create payments
    const payments: POSPayment[] = dto.payments.map((payment) => ({
      id: nanoid(),
      method: payment.method,
      amount: payment.amount,
      reference: payment.reference,
      metadata: {},
    }));

    const sale: POSSale = {
      id: nanoid(),
      saleNumber: this.generateSaleNumber(),
      sessionId: dto.sessionId,
      customerId: dto.customerId,
      items: items.map((item) => ({ ...item, saleId: '' })),
      subtotal,
      tax,
      discount,
      total,
      payments,
      status: 'completed',
      metadata: {},
      createdAt: new Date(),
    };

    // Set saleId on items
    sale.items = sale.items.map((item) => ({ ...item, saleId: sale.id }));

    await this.saleRepo.save(sale);

    // TODO: Update session totals
    // await this.updateSessionTotals(sale.sessionId, sale.total);

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
