# 🛒 E-commerce Backend + POS

**Headless, API-first e-commerce platform** with integrated Point of Sale (POS) capabilities.

Built with **TypeScript**, **Hono**, **PostgreSQL**, **Redis**, and **NATS**.

---

## 🎯 Features

- **Product Management**: Products, variants, SKUs, collections, attributes
- **Inventory Tracking**: Multi-warehouse stock management with reservations
- **Order Processing**: Cart, checkout, payments, fulfillment
- **Customer Management**: Profiles, addresses, authentication
- **POS Integration**: Terminal sessions, sales, barcode scanning, offline sync
- **Promotions**: Coupons, discounts, automatic promotions
- **Webhooks & Apps**: Extensibility via webhooks and third-party apps
- **Auth & RBAC**: JWT-based authentication with role-based access control

---

## 🏗️ Architecture

**Modular Monolith** with **Domain-Driven Design (DDD)**

- Clean Architecture
- Event-Driven (NATS)
- Repository Pattern
- Dependency Injection
- CQRS-ready

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full details.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose

### 1. Clone & Install

```bash
git clone <repo-url>
cd backend-ecommerce-pos
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start Infrastructure

```bash
docker-compose up -d
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- NATS (port 4222)
- MinIO (port 9000)

### 4. Run Database Migrations

```bash
npm run migrate
```

### 5. Start Development Server

```bash
npm run dev
```

Server runs at: `http://localhost:3000`

---

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api/v1
```

### Authentication

Most endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register` | POST | Register new user |
| `/auth/login` | POST | Login and get JWT tokens |
| `/auth/refresh` | POST | Refresh access token |
| `/products` | GET | List products |
| `/products` | POST | Create product |
| `/products/:id` | GET | Get product details |
| `/products/:id/variants` | POST | Add variant |
| `/orders` | GET | List orders |
| `/orders` | POST | Create order |
| `/customers` | GET | List customers |
| `/inventory/stock/:variantId` | GET | Check stock level |
| `/pos/sessions` | POST | Open POS session |
| `/pos/sales` | POST | Create POS sale |
| `/pos/products/lookup` | GET | Barcode/SKU lookup |

See [docs/API_REFERENCE.md](./docs/API_REFERENCE.md) for complete API documentation.

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run with coverage
npm test -- --coverage
```

---

## 🛠️ Development

### Project Structure

```
src/
├── modules/           # Business modules (Products, Orders, etc.)
│   ├── products/
│   ├── orders/
│   ├── customers/
│   ├── inventory/
│   ├── pos/
│   ├── promotions/
│   ├── webhooks/
│   └── auth/
├── core/              # Core domain patterns
│   ├── domain/        # Base entities, value objects
│   └── infrastructure/# Database, event bus, Redis
├── shared/            # Shared utilities
│   ├── middleware/
│   ├── validation/
│   └── errors/
└── main.ts            # Application entry point
```

### Module Structure

Each module follows DDD structure:

```
module/
├── domain/        # Entities, aggregates, value objects
├── repository/    # Data access
├── service/       # Business logic
├── routes/        # HTTP endpoints
├── dto/           # Data transfer objects (validation)
└── events/        # Domain events
```

---

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt (12 rounds)
- Input validation with Zod
- SQL injection protection (parameterized queries)
- CORS configuration
- Rate limiting (Redis-based)

---

## 📦 Deployment

### Docker Production Build

```bash
docker build -f docker/Dockerfile -t ecommerce-backend .
docker run -p 3000:3000 --env-file .env ecommerce-backend
```

### Docker Compose

```bash
docker-compose up -d
```

---

## 🧩 Tech Stack

| Component | Technology |
|-----------|-----------|
| **Runtime** | Node.js 20+ |
| **Framework** | Hono (modern, fast web framework) |
| **Language** | TypeScript (strict mode) |
| **Database** | PostgreSQL 16 |
| **Cache** | Redis 7 |
| **Event Bus** | NATS Streaming |
| **Storage** | S3-compatible (MinIO) |
| **Validation** | Zod |
| **Testing** | Vitest |
| **CI/CD** | GitHub Actions |

---

## 📖 Additional Documentation

- [Architecture Overview](./ARCHITECTURE.md)
- [Database Schema](./docs/DATABASE_SCHEMA.md)
- [API Reference](./docs/API_REFERENCE.md)
- [Development Guide](./docs/DEVELOPMENT.md)

---

## 📄 License

MIT

---

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines first.

---

## 📬 Support

For issues and questions, please open a GitHub issue.
