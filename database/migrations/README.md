# Database Migrations

Complete database schema for the E-commerce Backend + POS system.

## Schema Overview

### Tables Created

#### Products & Inventory
- `products` - Product catalog
- `variants` - Product variants (SKU, price, etc.)
- `warehouses` - Warehouse locations
- `stock_levels` - Stock quantities per variant/warehouse
- `stock_movements` - Stock movement history

#### Customers & Orders
- `customers` - Customer profiles
- `customer_addresses` - Customer shipping/billing addresses
- `orders` - Customer orders
- `order_items` - Order line items

#### Point of Sale (POS)
- `pos_sessions` - Cash register sessions
- `pos_sales` - POS sales transactions
- `pos_sale_items` - POS sale line items
- `pos_sale_payments` - POS payment records

#### Authentication & Authorization
- `users` - System users
- `roles` - User roles
- `user_roles` - User-role associations

#### Commerce Features
- `shipping_zones` - Shipping geographic zones
- `shipping_rates` - Shipping rate configurations
- `tax_rates` - Tax rate configurations by region
- `coupons` - Promotional coupons
- `discounts` - Automatic discounts

## Running Migrations

### PostgreSQL

```bash
# Connect to your database
psql -U your_user -d your_database

# Run the migration
\i database/migrations/001_initial_schema.sql

# Verify tables were created
\dt
```

### Using psql command line

```bash
psql -U your_user -d your_database -f database/migrations/001_initial_schema.sql
```

### Using Node.js script

```bash
npm run migrate
```

## Rollback

If you need to drop all tables:

```sql
-- WARNING: This will delete all data!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO your_user;
GRANT ALL ON SCHEMA public TO public;
```

## Environment Variables

Ensure your `.env` file has the correct database connection:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce_db
```

## Indexes

The schema includes strategic indexes on:
- Primary keys (automatic)
- Foreign keys for JOIN performance
- Frequently queried fields (status, email, etc.)
- Timestamp fields for sorting
- Array fields using GIN indexes

## Constraints

- Foreign key constraints ensure referential integrity
- Check constraints validate enum values
- Unique constraints prevent duplicates
- NOT NULL constraints ensure data quality
