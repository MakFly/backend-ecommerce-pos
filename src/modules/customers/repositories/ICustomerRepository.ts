import { IQueryableRepository } from '@shared/interfaces/IRepository.js';
import { Customer } from '../models/Customer.js';

export interface ICustomerRepository extends IQueryableRepository<Customer> {
  findByEmail(email: string): Promise<Customer | null>;
}
