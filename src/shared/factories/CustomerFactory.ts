import { faker } from '@faker-js/faker';
import {
  Customer,
  CustomerAddress,
  CreateCustomerDto,
  CustomerStatus,
} from '@modules/customers/models/Customer.js';

/**
 * Data Factory for Customers
 *
 * SOLID Principles:
 * - Single Responsibility: Generate fake customer data only
 * - Open/Closed: Easy to extend with new methods
 *
 * Usage:
 * - Tests: Create fake customers for testing
 * - Seeding: Populate database with sample data
 */
export class CustomerFactory {
  /**
   * Generate a fake customer
   */
  static createCustomer(overrides?: Partial<Customer>): Customer {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    return {
      id: faker.string.nanoid(),
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      firstName,
      lastName,
      phone: faker.phone.number(),
      status: faker.helpers.arrayElement(['active', 'disabled', 'invited'] as CustomerStatus[]),
      emailVerified: faker.datatype.boolean(),
      addresses: [],
      tags: faker.helpers.arrayElements(
        ['vip', 'wholesale', 'retail', 'loyalty_member', 'new'],
        faker.number.int({ min: 0, max: 3 })
      ),
      totalSpent: faker.number.float({ min: 0, max: 5000, fractionDigits: 2 }),
      ordersCount: faker.number.int({ min: 0, max: 50 }),
      lastOrderAt: faker.date.recent({ days: 90 }),
      metadata: {},
      createdAt: faker.date.past(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  /**
   * Generate a fake customer address
   */
  static createCustomerAddress(customerId?: string, overrides?: Partial<CustomerAddress>): CustomerAddress {
    return {
      id: faker.string.nanoid(),
      customerId: customerId || faker.string.nanoid(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      company: faker.datatype.boolean() ? faker.company.name() : undefined,
      address1: faker.location.streetAddress(),
      address2: faker.datatype.boolean() ? faker.location.secondaryAddress() : undefined,
      city: faker.location.city(),
      region: faker.location.state(),
      postalCode: faker.location.zipCode(),
      country: faker.location.countryCode(),
      phone: faker.phone.number(),
      isDefault: faker.datatype.boolean(),
      ...overrides,
    };
  }

  /**
   * Generate a CreateCustomerDto for testing
   */
  static createCustomerDto(overrides?: Partial<CreateCustomerDto>): CreateCustomerDto {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    return {
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      firstName,
      lastName,
      phone: faker.phone.number(),
      ...overrides,
    };
  }

  /**
   * Generate multiple customers
   */
  static createCustomers(count: number, overrides?: Partial<Customer>): Customer[] {
    return Array.from({ length: count }, () => this.createCustomer(overrides));
  }

  /**
   * Generate multiple customer addresses
   */
  static createCustomerAddresses(customerId: string, count: number): CustomerAddress[] {
    const addresses = Array.from({ length: count }, (_, index) =>
      this.createCustomerAddress(customerId, { isDefault: index === 0 })
    );
    return addresses;
  }

  /**
   * Generate a complete customer with addresses
   */
  static createCustomerWithAddresses(addressCount: number = 2): {
    customer: Customer;
    addresses: CustomerAddress[];
  } {
    const customer = this.createCustomer({ status: 'active', emailVerified: true });
    const addresses = this.createCustomerAddresses(customer.id, addressCount);

    customer.addresses = addresses;

    return { customer, addresses };
  }

  /**
   * Generate a VIP customer
   */
  static createVIPCustomer(overrides?: Partial<Customer>): Customer {
    return this.createCustomer({
      status: 'active',
      emailVerified: true,
      tags: ['vip', 'loyalty_member'],
      totalSpent: faker.number.float({ min: 10000, max: 50000, fractionDigits: 2 }),
      ordersCount: faker.number.int({ min: 50, max: 200 }),
      ...overrides,
    });
  }

  /**
   * Generate a new customer
   */
  static createNewCustomer(overrides?: Partial<Customer>): Customer {
    return this.createCustomer({
      status: 'active',
      emailVerified: false,
      tags: ['new'],
      totalSpent: 0,
      ordersCount: 0,
      lastOrderAt: undefined,
      ...overrides,
    });
  }
}
