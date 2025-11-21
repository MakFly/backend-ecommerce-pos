# 🧪 TDD Guide — Test-Driven Development

Complete guide for developing features using TDD in this project.

---

## 📖 What is TDD?

**Test-Driven Development** is a software development approach where:

1. ✍️ You write a **failing test** first (RED)
2. ✅ You write **minimal code** to make it pass (GREEN)
3. 🔄 You **refactor** for quality (REFACTOR)

### Benefits

- 🛡️ Better code quality
- 📝 Built-in documentation
- 🚀 Confidence to refactor
- 🐛 Fewer bugs
- 🎯 Focus on requirements

---

## 🔄 TDD Cycle

```
┌─────────────────────────────────────┐
│ 1. RED: Write Failing Test          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 2. GREEN: Make It Pass              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 3. REFACTOR: Improve Code           │
└──────────────┬──────────────────────┘
               │
               └───────► Repeat
```

---

## 🚀 TDD Workflow (Example)

### Scenario: Add "Archive Product" Feature

#### Step 1: Write Failing Test (RED)

```typescript
// modules/products/__tests__/ProductService.test.ts

describe('archiveProduct', () => {
  it('should archive an active product', async () => {
    // Arrange
    const product = await service.createProduct({
      handle: 'test',
      title: 'Test Product',
      status: 'active',
    });

    // Act
    await service.archiveProduct(product.id);

    // Assert
    const archived = await service.getProduct(product.id);
    expect(archived.status).toBe('archived');
  });

  it('should throw error if product not found', async () => {
    await expect(
      service.archiveProduct('non-existent')
    ).rejects.toThrow('Product with id non-existent not found');
  });
});
```

**Run test:**
```bash
npm test -- ProductService.test.ts
```

**Result:** ❌ FAILS (method doesn't exist)

---

#### Step 2: Make It Pass (GREEN)

```typescript
// modules/products/services/ProductService.ts

async archiveProduct(id: string): Promise<void> {
  const product = await this.getProduct(id); // Reuse existing method

  await this.updateProduct(id, {
    status: 'archived',
  });
}
```

**Run test:**
```bash
npm test -- ProductService.test.ts
```

**Result:** ✅ PASSES

---

#### Step 3: Refactor (REFACTOR)

```typescript
// Refactor: Extract status transition logic

async archiveProduct(id: string): Promise<void> {
  await this.updateProductStatus(id, 'archived');
}

async activateProduct(id: string): Promise<void> {
  await this.updateProductStatus(id, 'active');
}

private async updateProductStatus(
  id: string,
  status: ProductStatus
): Promise<void> {
  await this.updateProduct(id, { status });
}
```

**Run test:**
```bash
npm test
```

**Result:** ✅ Still PASSES (refactored without breaking)

---

## 🎯 TDD Best Practices

### 1. Test One Thing at a Time

❌ **Bad:**
```typescript
it('should create, update, and delete product', async () => {
  // Testing 3 things
});
```

✅ **Good:**
```typescript
it('should create a product', async () => {});
it('should update a product', async () => {});
it('should delete a product', async () => {});
```

### 2. Use AAA Pattern (Arrange, Act, Assert)

```typescript
it('should calculate total price', () => {
  // Arrange: Set up test data
  const items = [
    { price: 10, quantity: 2 },
    { price: 5, quantity: 3 },
  ];

  // Act: Execute the function
  const total = calculateTotal(items);

  // Assert: Verify result
  expect(total).toBe(35);
});
```

### 3. Test Behavior, Not Implementation

❌ **Bad:** Testing internal details
```typescript
it('should call repository.save', () => {
  // Don't test implementation details
});
```

✅ **Good:** Testing behavior
```typescript
it('should create a product with unique handle', async () => {
  // Test what the user cares about
});
```

### 4. Use Descriptive Test Names

❌ **Bad:**
```typescript
it('test1', () => {});
```

✅ **Good:**
```typescript
it('should throw error when creating product with duplicate handle', () => {});
```

### 5. Keep Tests Fast

- Use mocks for external dependencies
- Avoid actual database calls in unit tests
- Use in-memory implementations

```typescript
// Mock repository
class MockProductRepository implements IProductRepository {
  private products: Product[] = [];
  // ...
}
```

---

## 🧰 Testing Tools

### Vitest

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(() => {
    service = new ProductService(mockRepository);
  });

  it('should work', () => {
    expect(true).toBe(true);
  });
});
```

### Test Doubles

**Mock:** Fake implementation with predefined behavior

```typescript
const mockRepo = {
  save: vi.fn().mockResolvedValue(undefined),
};
```

**Stub:** Provides canned answers

```typescript
const stubRepo = {
  findById: () => Promise.resolve(testProduct),
};
```

**Spy:** Records how it was called

```typescript
const spy = vi.spyOn(repository, 'save');
expect(spy).toHaveBeenCalledWith(product);
```

---

## 📝 Creating a New Module with TDD

### Step-by-Step Guide

#### 1. Create Module Structure

```bash
mkdir -p src/modules/orders/{__tests__,models,repositories,services,controllers,validators}
```

#### 2. Define Model

```typescript
// models/Order.ts
export interface Order {
  id: string;
  total: number;
  status: OrderStatus;
  // ...
}
```

#### 3. Write Interface

```typescript
// repositories/IOrderRepository.ts
export interface IOrderRepository extends IRepository<Order> {
  findByCustomerId(customerId: string): Promise<Order[]>;
}
```

#### 4. Write Test First

```typescript
// __tests__/OrderService.test.ts
describe('OrderService', () => {
  it('should create an order', async () => {
    const order = await service.createOrder({
      customerId: 'customer-1',
      items: [{ variantId: 'v1', quantity: 2 }],
    });

    expect(order.id).toBeDefined();
  });
});
```

#### 5. Implement Service

```typescript
// services/OrderService.ts
export class OrderService {
  constructor(private repo: IOrderRepository) {}

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    // Implementation
  }
}
```

#### 6. Run Tests

```bash
npm test -- OrderService.test.ts
```

---

## 🎓 Common TDD Patterns

### Test Setup with beforeEach

```typescript
describe('ProductService', () => {
  let service: ProductService;
  let mockRepo: MockProductRepository;

  beforeEach(() => {
    mockRepo = new MockProductRepository();
    service = new ProductService(mockRepo);
  });

  // Tests use fresh instances
});
```

### Testing Async Operations

```typescript
it('should handle async operations', async () => {
  const result = await service.asyncMethod();
  expect(result).toBeDefined();
});
```

### Testing Errors

```typescript
it('should throw error for invalid input', async () => {
  await expect(
    service.createProduct({ handle: '' })
  ).rejects.toThrow('Handle cannot be empty');
});
```

### Parametrized Tests

```typescript
it.each([
  ['draft', true],
  ['active', false],
  ['archived', false],
])('should check if status %s is draft: %s', (status, expected) => {
  expect(isDraft(status)).toBe(expected);
});
```

---

## 📊 Test Coverage

Run coverage report:

```bash
npm test -- --coverage
```

**Target:** 80%+ coverage

**Focus:**
- ✅ Business logic (services)
- ✅ Critical paths
- ⚠️ Don't obsess over 100%

---

## 🚦 When NOT to Use TDD

- Simple CRUD operations (use existing patterns)
- Prototyping / spikes
- Legacy code without tests (refactor first)
- UI/UX experimentation

---

## 📚 Resources

- [Kent Beck - Test Driven Development](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530)
- [Martin Fowler - TDD](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
- [Vitest Documentation](https://vitest.dev/)

---

**Remember:** TDD is a skill that improves with practice. Start small, stay disciplined, and enjoy the confidence it brings! 🚀
