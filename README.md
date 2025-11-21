# 🛒 E-commerce Backend + POS

**Modern e-commerce API** with REST + GraphQL, built with **TDD** and **SOLID** principles.

TypeScript • Hono • PostgreSQL • Redis • NATS • GraphQL

---

## ✨ Features

- 🎨 **Dual API**: REST + GraphQL
- 📦 **Product Management**: Products, variants, SKUs
- 📊 **Inventory Tracking**: Multi-warehouse stock
- 🛒 **Order Processing**: Cart, checkout, payments
- 👥 **Customer Management**: Profiles & auth
- 🏪 **POS Integration**: Point of Sale ready
- 🎁 **Promotions**: Coupons & discounts
- 🔌 **Webhooks**: Extensible via events
- 🔐 **Auth & RBAC**: JWT + role-based access

---

## 🏗️ Architecture

**TDD (Test-Driven Development) + SOLID Principles**

- ✅ Tests written **first** (Red → Green → Refactor)
- ✅ Classic **Dependency Injection** (no magic)
- ✅ Single Responsibility per class
- ✅ Interface-based design
- ✅ REST + GraphQL APIs

See [ARCHITECTURE.md](./ARCHITECTURE.md) for details.

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
npm run migrate
```

### 5. Seed Database (Optional)

```bash
npm run seed
```

Creates 50 fake products with variants using **DataFactory**.

### 6. Start Dev Server

```bash
npm run dev
```

Server runs at: `http://localhost:3000`

---

## 🌐 APIs

### REST API

```
http://localhost:3000/api/v1
```

**Endpoints:**
- `GET /products` - List products
- `GET /products/:id` - Get product
- `POST /products` - Create product
- `PATCH /products/:id` - Update product
- `DELETE /products/:id` - Delete product

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
├── modules/                    # Business modules
│   └── products/              # ✅ Complete example
│       ├── __tests__/         # TDD tests
│       ├── models/            # Data models
│       ├── repositories/      # Data access
│       ├── services/          # Business logic
│       ├── controllers/       # HTTP handlers
│       ├── validators/        # Input validation
│       └── routes.ts          # REST routes
│
├── graphql/                   # GraphQL Layer
│   ├── schema/                # GraphQL schemas
│   ├── resolvers/             # GraphQL resolvers
│   └── index.ts               # GraphQL setup
│
├── infrastructure/            # Infrastructure
│   ├── database/              # PostgreSQL
│   ├── cache/                 # Redis
│   └── events/                # NATS
│
├── shared/
│   ├── interfaces/            # Common interfaces
│   ├── middleware/            # Auth, validation, errors
│   └── factories/             # 🏭 Data factories
│       ├── ProductFactory.ts  # Generate fake products
│       ├── DataFactory.ts     # Master factory
│       └── seed.ts            # Database seeder
│
└── main.ts                    # Entry point (Classic DI)
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

## 🚦 Roadmap

- ✅ Products Module (TDD + REST + GraphQL)
- ✅ Data Factory (Faker.js)
- ✅ Classic Dependency Injection
- 🔜 Orders Module (TDD)
- 🔜 Customers Module (TDD)
- 🔜 Auth Module (JWT + RBAC)
- 🔜 Inventory Module
- 🔜 POS Module

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
