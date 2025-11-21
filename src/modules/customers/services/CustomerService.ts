import { nanoid } from 'nanoid';
import { ICustomerRepository } from '../repositories/ICustomerRepository.js';
import {
  Customer,
  CreateCustomerDto,
  UpdateCustomerDto,
  AddAddressDto,
} from '../models/Customer.js';
import { ICrudService } from '@shared/interfaces/IService.js';

export class CustomerService
  implements ICrudService<Customer, CreateCustomerDto, UpdateCustomerDto>
{
  constructor(private readonly repository: ICustomerRepository) {}

  async createCustomer(dto: CreateCustomerDto): Promise<Customer> {
    const existing = await this.repository.findByEmail(dto.email);
    if (existing) {
      throw new Error(`Customer with email ${dto.email} already exists`);
    }

    const customer: Customer = {
      id: nanoid(),
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      acceptsMarketing: dto.acceptsMarketing ?? false,
      addresses: [],
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.repository.save(customer);
    return customer;
  }

  async getCustomer(id: string): Promise<Customer> {
    const customer = await this.repository.findById(id);
    if (!customer) {
      throw new Error(`Customer with id ${id} not found`);
    }
    return customer;
  }

  async updateCustomer(id: string, dto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.getCustomer(id);

    const updated: Customer = {
      ...customer,
      ...dto,
      updatedAt: new Date(),
    };

    await this.repository.update(id, updated);
    return this.getCustomer(id);
  }

  async deleteCustomer(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async listCustomers(options?: { limit?: number; offset?: number }): Promise<Customer[]> {
    return this.repository.findAll(options);
  }

  async getCustomerByEmail(email: string): Promise<Customer | null> {
    return this.repository.findByEmail(email);
  }

  // Alias methods
  create = this.createCustomer;
  getById = this.getCustomer;
  getAll = this.listCustomers;
  update = this.updateCustomer;
  delete = this.deleteCustomer;
}
