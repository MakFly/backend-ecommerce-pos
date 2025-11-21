import { IQueryableRepository } from '@shared/interfaces/IRepository.js';
import { Order, Cart } from '../models/Order.js';

/**
 * Order Repository Interface
 *
 * SOLID: DIP - Service depends on this interface
 */
export interface IOrderRepository extends IQueryableRepository<Order> {
  findByOrderNumber(orderNumber: string): Promise<Order | null>;
  findByCustomerId(customerId: string): Promise<Order[]>;
  findByEmail(email: string): Promise<Order[]>;
}

export interface ICartRepository extends IQueryableRepository<Cart> {
  findByCustomerId(customerId: string): Promise<Cart | null>;
  findActiveCart(customerId: string): Promise<Cart | null>;
}
