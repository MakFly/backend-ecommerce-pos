import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import { User, Role, Permission } from '@modules/auth/models/Auth.js';

/**
 * Data Factory for Auth
 *
 * SOLID Principles:
 * - Single Responsibility: Generate fake auth data only
 * - Open/Closed: Easy to extend with new methods
 *
 * Usage:
 * - Tests: Create fake users and roles for testing
 * - Seeding: Populate database with sample data
 */
export class AuthFactory {
  /**
   * Generate a fake user
   */
  static async createUser(overrides?: Partial<User>): Promise<User> {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();

    // Default password: "password123" (hashed)
    const passwordHash = await bcrypt.hash('password123', 10);

    return {
      id: faker.string.nanoid(),
      email,
      passwordHash,
      firstName,
      lastName,
      phone: faker.phone.number(),
      roles: [this.createRole({ name: 'user' })],
      isActive: faker.datatype.boolean({ probability: 0.9 }),
      emailVerified: faker.datatype.boolean({ probability: 0.8 }),
      lastLoginAt: faker.date.recent({ days: 30 }),
      metadata: {},
      createdAt: faker.date.past(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  /**
   * Generate a fake user (sync - no password hashing)
   */
  static createUserSync(overrides?: Partial<User>): User {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();

    return {
      id: faker.string.nanoid(),
      email,
      passwordHash: '$2b$10$dummyHashForTesting', // Dummy hash
      firstName,
      lastName,
      phone: faker.phone.number(),
      roles: [this.createRole({ name: 'user' })],
      isActive: faker.datatype.boolean({ probability: 0.9 }),
      emailVerified: faker.datatype.boolean({ probability: 0.8 }),
      lastLoginAt: faker.date.recent({ days: 30 }),
      metadata: {},
      createdAt: faker.date.past(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  /**
   * Generate a fake role
   */
  static createRole(overrides?: Partial<Role>): Role {
    const name = faker.helpers.arrayElement(['admin', 'user', 'manager', 'cashier', 'warehouse_staff']);

    return {
      id: faker.string.nanoid(),
      name,
      description: `${name.charAt(0).toUpperCase() + name.slice(1)} role`,
      permissions: this.createPermissionsForRole(name),
      isActive: true,
      createdAt: faker.date.past(),
      ...overrides,
    };
  }

  /**
   * Generate a fake permission
   */
  static createPermission(overrides?: Partial<Permission>): Permission {
    const resource = faker.helpers.arrayElement(['products', 'orders', 'customers', 'inventory', 'pos']);
    const action = faker.helpers.arrayElement(['read', 'create', 'update', 'delete']);

    return {
      id: faker.string.nanoid(),
      resource,
      action,
      description: `Can ${action} ${resource}`,
      ...overrides,
    };
  }

  /**
   * Generate permissions for a specific role
   */
  static createPermissionsForRole(roleName: string): Permission[] {
    const allPermissions: Permission[] = [
      this.createPermission({ resource: 'products', action: 'read' }),
      this.createPermission({ resource: 'products', action: 'create' }),
      this.createPermission({ resource: 'products', action: 'update' }),
      this.createPermission({ resource: 'products', action: 'delete' }),
      this.createPermission({ resource: 'orders', action: 'read' }),
      this.createPermission({ resource: 'orders', action: 'create' }),
      this.createPermission({ resource: 'orders', action: 'update' }),
      this.createPermission({ resource: 'customers', action: 'read' }),
      this.createPermission({ resource: 'customers', action: 'create' }),
      this.createPermission({ resource: 'inventory', action: 'read' }),
      this.createPermission({ resource: 'pos', action: 'read' }),
      this.createPermission({ resource: 'pos', action: 'create' }),
    ];

    switch (roleName) {
      case 'admin':
        return allPermissions;
      case 'manager':
        return allPermissions.filter((p) => p.action !== 'delete');
      case 'cashier':
        return allPermissions.filter((p) =>
          ['pos', 'orders', 'customers'].includes(p.resource) && ['read', 'create'].includes(p.action)
        );
      case 'warehouse_staff':
        return allPermissions.filter((p) =>
          ['inventory', 'products'].includes(p.resource) && ['read', 'update'].includes(p.action)
        );
      case 'user':
      default:
        return allPermissions.filter((p) => p.action === 'read');
    }
  }

  /**
   * Generate multiple users
   */
  static async createUsers(count: number, overrides?: Partial<User>): Promise<User[]> {
    const users: User[] = [];
    for (let i = 0; i < count; i++) {
      users.push(await this.createUser(overrides));
    }
    return users;
  }

  /**
   * Generate multiple users (sync)
   */
  static createUsersSync(count: number, overrides?: Partial<User>): User[] {
    return Array.from({ length: count }, () => this.createUserSync(overrides));
  }

  /**
   * Generate multiple roles
   */
  static createRoles(): Role[] {
    return [
      this.createRole({ name: 'admin', description: 'Full system access' }),
      this.createRole({ name: 'manager', description: 'Manager access' }),
      this.createRole({ name: 'cashier', description: 'POS and order access' }),
      this.createRole({ name: 'warehouse_staff', description: 'Inventory management' }),
      this.createRole({ name: 'user', description: 'Basic read access' }),
    ];
  }

  /**
   * Generate an admin user
   */
  static async createAdminUser(overrides?: Partial<User>): Promise<User> {
    return this.createUser({
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      roles: [this.createRole({ name: 'admin' })],
      isActive: true,
      emailVerified: true,
      ...overrides,
    });
  }

  /**
   * Generate a cashier user
   */
  static async createCashierUser(overrides?: Partial<User>): Promise<User> {
    return this.createUser({
      roles: [this.createRole({ name: 'cashier' })],
      isActive: true,
      emailVerified: true,
      ...overrides,
    });
  }

  /**
   * Generate a customer user
   */
  static async createCustomerUser(overrides?: Partial<User>): Promise<User> {
    return this.createUser({
      roles: [this.createRole({ name: 'user' })],
      isActive: true,
      emailVerified: true,
      ...overrides,
    });
  }
}
