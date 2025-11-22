# 🛒 E-commerce Backend + POS

**Production-ready e-commerce API** with REST + GraphQL, built with **TDD** and **SOLID** principles.

> Complete backend solution with 8 modules, JWT authentication, Zod validation, and full inter-module integration.

TypeScript • Hono • PostgreSQL • Redis • NATS • GraphQL • JWT • Zod

---

## ✨ Features

### 🎯 Complete E-commerce Modules
- ✅ **Products & Categories**: Full catalog management with variants, SKUs, and options
- ✅ **Inventory Management**: Multi-warehouse stock tracking with reservations
- ✅ **Order Processing**: Complete order flow with payment and fulfillment
- ✅ **Customer Management**: Profiles, addresses, and history
- ✅ **POS System**: Point-of-Sale with sessions, sales, and cash management
- ✅ **Promotions**: Coupons, discounts, and validation logic
- ✅ **Shipping**: Zone-based rates with calculation engine
- ✅ **Tax Calculation**: Country/region taxes with compound tax support

### 🔐 Security & Validation
- ✅ **JWT Authentication**: Access + refresh tokens with role-based authorization
- ✅ **Zod Validation**: Type-safe request validation with detailed error messages
- ✅ **Bcrypt Password Hashing**: Secure password storage
- ✅ **Middleware**: Auth, validation, error handling

### 🎨 Dual API Architecture
- ✅ **REST API**: Complete CRUD endpoints for all modules
- ✅ **GraphQL API**: Flexible queries with graphql-yoga
- ✅ **Inter-Module Integration**: Orders → Inventory, Taxes, Shipping, Promotions

### 🏗️ Production-Ready
- ✅ **Docker Compose**: PostgreSQL, Redis, NATS ready to go
- ✅ **Health Checks**: Monitor service status
- ✅ **Error Handling**: Global error handler with standardized responses
- ✅ **Environment Config**: Comprehensive .env.example
- ✅ **Database Migrations**: Complete schema with 20+ tables

---

## 🏗️ Architecture

**TDD (Test-Driven Development) + SOLID Principles + Classic DI**

- ✅ **Classic Dependency Injection** (manual constructor injection, no Container)
- ✅ **Repository Pattern** with interface segregation
- ✅ **Service Layer** with full inter-module integration
- ✅ **Single Responsibility** per class
- ✅ **Interface-based design** (IDatabase, IRepository, etc.)
- ✅ **REST + GraphQL** dual APIs

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose

### 1. Install

```bash
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env
# Edit .env with your config
```

### 3. Start Infrastructure

```bash
docker-compose up -d
```

Starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- NATS (port 4222)
- MinIO (port 9000)

### 4. Run Migrations

```bash
psql $DATABASE_URL -f database/migrations/001_initial_schema.sql
```

This creates 20+ tables for all modules: products, orders, customers, inventory, POS, promotions, shipping, taxes, and more.

### 5. Seed Database (Optional)

```bash
npm run seed
```

Creates fake data using **DataFactory** (Faker.js).

### 6. Start Dev Server

```bash
npm run dev
```

Server runs at: `http://localhost:3000`

**API Endpoints:**
- REST API: `http://localhost:3000/api/v1`
- GraphQL: `http://localhost:3000/graphql`
- Health Check: `http://localhost:3000/health`

---

## 🌐 APIs

### REST API

Base URL: `http://localhost:3000/api/v1`

#### 🔐 Authentication (`/auth`)
- `POST /register` - Register new user (Zod validated)
- `POST /login` - Login with email/password (Zod validated)
- `POST /refresh` - Refresh access token (Zod validated)
- `GET /me` - Get current user (requires JWT)
- `GET /users` - List users
- `GET /roles` - List roles

#### 📦 Products (`/products`)
- `GET /products` - List products with pagination
- `GET /products/:id` - Get product details
- `POST /products` - Create product (Zod validated)
- `PATCH /products/:id` - Update product
- `DELETE /products/:id` - Delete product

#### 🛒 Orders (`/orders`)
- `GET /orders` - List orders
- `GET /orders/:id` - Get order details
- `POST /orders` - Create order (Zod validated, full integration)
- `PATCH /orders/:id` - Update order
- `POST /orders/:id/cancel` - Cancel order (releases stock)

#### 📊 Inventory (`/inventory`)
- `GET /warehouses` - List warehouses
- `GET /warehouses/:id` - Get warehouse
- `GET /stock-levels` - List stock levels
- `POST /stock-levels/reserve` - Reserve stock (Zod validated)
- `POST /stock-levels/release` - Release stock (Zod validated)
- `POST /stock-levels/adjust` - Adjust stock (Zod validated)
- `GET /stock-movements` - Get stock history

#### 🏪 POS (`/pos`)
- `GET /sessions` - List POS sessions
- `POST /sessions` - Open session (Zod validated)
- `PUT /sessions/:id/close` - Close session (Zod validated)
- `GET /sales` - List sales
- `POST /sales` - Create sale (Zod validated)

#### 🎁 Promotions (`/promotions`)
- `POST /validate-coupon` - Validate coupon (Zod validated)
- `POST /apply-discounts` - Apply discounts
- `GET /coupons` - List coupons
- `GET /discounts` - List active discounts

#### 🚚 Shipping (`/shipping`)
- `POST /calculate` - Calculate shipping quotes (Zod validated)
- `GET /zones` - List shipping zones
- `GET /rates` - List shipping rates

#### 💰 Taxes (`/taxes`)
- `POST /calculate` - Calculate taxes (Zod validated)
- `GET /rates` - List tax rates

### GraphQL API

```
http://localhost:3000/graphql
```

**Interactive Playground** with autocomplete & docs!

**Example Query:**
```graphql
query GetProducts {
  products(limit: 10) {
    id
    title
    handle
    status
  }
}
```

**Example Mutation:**
```graphql
mutation CreateProduct {
  createProduct(input: {
    handle: "cool-tshirt"
    title: "Cool T-Shirt"
    status: ACTIVE
  }) {
    id
    title
  }
}
```

See [GRAPHQL_EXAMPLES.md](./docs/GRAPHQL_EXAMPLES.md) for complete examples.

---

## 📂 Project Structure

```
src/
├── modules/                      # 8 Complete Business Modules
│   ├── products/                 # ✅ Products & Variants
│   │   ├── models/              # Product, Variant DTOs
│   │   ├── repositories/        # ProductRepository, VariantRepository
│   │   ├── services/            # ProductService
│   │   ├── controllers/         # ProductController
│   │   └── routes.ts            # REST routes
│   │
│   ├── orders/                   # ✅ Order Management
│   │   ├── models/              # Order, OrderItem DTOs
│   │   ├── repositories/        # OrderRepository
│   │   ├── services/            # OrderService (with full integration)
│   │   └── routes.ts
│   │
│   ├── customers/                # ✅ Customer Profiles
│   ├── inventory/                # ✅ Multi-Warehouse Stock
│   │   ├── repositories/        # Warehouse, StockLevel, StockMovement
│   │   ├── services/            # InventoryService
│   │   └── routes.ts
│   │
│   ├── pos/                      # ✅ Point of Sale
│   │   ├── repositories/        # POSSessionRepository, POSSaleRepository
│   │   ├── services/            # POSService
│   │   └── routes.ts
│   │
│   ├── auth/                     # ✅ JWT Authentication
│   │   ├── repositories/        # UserRepository, RoleRepository
│   │   ├── services/            # AuthService (bcrypt + JWT)
│   │   └── routes.ts
│   │
│   ├── promotions/               # ✅ Coupons & Discounts
│   │   ├── repositories/        # CouponRepository, DiscountRepository
│   │   ├── services/            # PromotionService (validation logic)
│   │   └── routes.ts
│   │
│   ├── shipping/                 # ✅ Shipping Calculation
│   │   ├── repositories/        # ShippingZone, ShippingRate
│   │   ├── services/            # ShippingService (zone-based calculation)
│   │   └── routes.ts
│   │
│   └── taxes/                    # ✅ Tax Calculation
│       ├── repositories/        # TaxRateRepository
│       ├── services/            # TaxService (compound tax support)
│       └── routes.ts
│
├── graphql/                      # GraphQL Layer
│   ├── schema/                  # GraphQL type definitions
│   ├── resolvers/               # GraphQL resolvers
│   └── index.ts                 # GraphQL Yoga setup
│
├── infrastructure/               # Infrastructure
│   ├── database/                # PostgreSQL client
│   ├── cache/                   # Redis client
│   └── events/                  # NATS client
│
├── shared/
│   ├── interfaces/              # IDatabase, IRepository, etc.
│   ├── middleware/              # ✅ Production-ready middleware
│   │   ├── authMiddleware.ts   # JWT verification + RBAC
│   │   ├── validationMiddleware.ts  # Zod validation
│   │   └── errorMiddleware.ts  # Global error handler
│   │
│   ├── validation/              # ✅ Zod Schemas
│   │   └── schemas.ts          # 15+ validation schemas
│   │
│   └── factories/               # 🏭 Data Factories (Faker.js)
│       ├── ProductFactory.ts
│       ├── DataFactory.ts
│       └── seed.ts
│
├── database/
│   └── migrations/              # SQL Migrations
│       └── 001_initial_schema.sql  # 20+ tables, indexes, constraints
│
└── main.ts                       # Entry point with Classic DI wiring
```

---

## 🏭 Data Factory

Generate fake data for tests & seeding:

```typescript
import { DataFactory } from '@shared/factories/DataFactory.js';

// Create one product
const product = DataFactory.product.createProduct();

// Create many products
const products = DataFactory.product.createProducts(10);

// Create product with variants
const { product, variants } = DataFactory.product.createProductWithVariants(3);

// Seed database
await DataFactory.seedProducts(database, 50);
```

Powered by **Faker.js** for realistic data.

---

## 🧪 Testing (TDD)

```bash
# Run all tests
npm test

# Watch mode (TDD workflow)
npm test -- --watch

# Specific test
npm test -- ProductService.test.ts

# Coverage
npm test -- --coverage
```

**TDD Workflow:**
1. Write test (RED)
2. Make it pass (GREEN)
3. Refactor (REFACTOR)

See [TDD_GUIDE.md](./docs/TDD_GUIDE.md) for complete guide.

---

## 🔌 Dependency Injection

**Classic DI** (no Container magic):

```typescript
// main.ts

// Infrastructure
const database = new PostgresDatabase(connectionString);
const cache = new RedisCache(config);

// Products Module (manual wiring)
const productRepository = new ProductRepository(database);
const productService = new ProductService(productRepository);
const productController = new ProductController(productService);

// Inject into routes
const productRoutes = createProductRoutes(database);

// Inject into GraphQL
const graphql = createGraphQLHandler({
  database,
  cache,
  productService, // ← Services available in resolvers
});
```

**Simple, explicit, and testable!**

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | TDD + SOLID architecture |
| [TDD_GUIDE.md](./docs/TDD_GUIDE.md) | Complete TDD workflow |
| [GRAPHQL_EXAMPLES.md](./docs/GRAPHQL_EXAMPLES.md) | GraphQL queries & mutations |
| [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) | Database schema & ERD |
| [API_REFERENCE.md](./docs/API_REFERENCE.md) | REST API reference |

---

## 🧰 Tech Stack

| Component | Technology |
|-----------|-----------|
| **Runtime** | Node.js 20+ |
| **Framework** | Hono |
| **Language** | TypeScript (strict) |
| **APIs** | REST + GraphQL |
| **GraphQL** | graphql-yoga |
| **Database** | PostgreSQL |
| **Cache** | Redis |
| **Events** | NATS |
| **Validation** | Zod |
| **Testing** | Vitest |
| **Fake Data** | Faker.js |

---

## 📦 Scripts

```bash
npm run dev          # Start dev server (watch mode)
npm run build        # Build for production
npm run start        # Start production server

npm test             # Run tests
npm test -- --watch  # TDD watch mode

npm run seed         # Seed database with fake data
npm run migrate      # Run database migrations

npm run lint         # Lint code
npm run format       # Format code

npm run docker:up    # Start Docker services
npm run docker:down  # Stop Docker services
```

---

## 🎯 Examples

### REST API (cURL)

```bash
# List products
curl http://localhost:3000/api/v1/products

# Create product
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "handle": "cool-hoodie",
    "title": "Cool Hoodie",
    "status": "active"
  }'
```

### GraphQL API (cURL)

```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { products { id title } }"
  }'
```

### Using Data Factory (Test)

```typescript
// __tests__/ProductService.test.ts
import { DataFactory } from '@shared/factories/DataFactory.js';

it('should create a product', async () => {
  const dto = DataFactory.product.createProductDto();
  const product = await service.createProduct(dto);

  expect(product.id).toBeDefined();
});
```

---

## 🔄 Inter-Module Integration

The **OrderService** demonstrates complete inter-module integration:

```typescript
// Order creation flow integrates 5 services:
export class OrderService {
  constructor(
    private readonly repository: IOrderRepository,
    private readonly inventoryService?: InventoryService,    // Stock reservation
    private readonly taxService?: TaxService,                // Tax calculation
    private readonly shippingService?: ShippingService,      // Shipping quotes
    private readonly promotionService?: PromotionService     // Coupon validation
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    // 1. Calculate item subtotals
    // 2. Apply promotions (validate coupon)
    // 3. Calculate shipping (zone-based rates)
    // 4. Calculate taxes (compound tax support)
    // 5. Reserve inventory (atomic stock updates)
    // 6. Create order in database
  }
}
```

**Order Creation Flow:**
1. **Items** → Calculate subtotal
2. **Promotions** → Validate coupon, apply discounts
3. **Shipping** → Calculate shipping quotes by zone
4. **Taxes** → Calculate taxes (country/region with compound support)
5. **Inventory** → Reserve stock atomically
6. **Order** → Save to database with complete totals

**Order Cancellation Flow:**
- Automatically releases reserved stock via InventoryService

## ✅ What's Complete

### Core Modules
- ✅ **Products Module** - Full CRUD with variants, categories, options
- ✅ **Orders Module** - Complete flow with full integration
- ✅ **Customers Module** - Profiles, addresses, order history
- ✅ **Auth Module** - JWT + RBAC + bcrypt
- ✅ **Inventory Module** - Multi-warehouse with stock movements
- ✅ **POS Module** - Sessions, sales, cash management

### Supporting Modules
- ✅ **Promotions** - Coupons + discounts with validation
- ✅ **Shipping** - Zone-based calculation engine
- ✅ **Taxes** - Country/region taxes with compound support

### Infrastructure
- ✅ **Database** - 20+ tables with migrations
- ✅ **Repositories** - Complete data access layer
- ✅ **Services** - Business logic with integration
- ✅ **REST Routes** - 50+ endpoints with validation
- ✅ **GraphQL API** - Dual API support
- ✅ **JWT Auth** - Access + refresh tokens
- ✅ **Zod Validation** - 15+ schemas with error messages
- ✅ **Data Factory** - Faker.js for seeding
- ✅ **Docker Compose** - Local development stack
- ✅ **Health Checks** - Service monitoring
- ✅ **Error Handling** - Global error handler

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch
3. **Write tests first (TDD)**
4. Implement feature
5. Ensure tests pass
6. Submit PR

---

## 📄 License

MIT

---

**Built with ❤️ using TDD + SOLID + GraphQL**

🌐 REST API • ⚡ GraphQL • 🏭 Data Factory • 🧪 TDD
