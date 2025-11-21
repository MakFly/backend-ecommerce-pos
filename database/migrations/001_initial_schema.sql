-- =====================================================
-- E-Commerce Backend + POS - Initial Schema
-- TDD + SOLID Architecture
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PRODUCTS & VARIANTS
-- =====================================================

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(255) PRIMARY KEY,
  handle VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL CHECK (status IN ('draft', 'active', 'archived')),
  vendor VARCHAR(255),
  product_type VARCHAR(255),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_handle ON products(handle);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_vendor ON products(vendor);

CREATE TABLE IF NOT EXISTS variants (
  id VARCHAR(255) PRIMARY KEY,
  product_id VARCHAR(255) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku VARCHAR(255) UNIQUE,
  barcode VARCHAR(255),
  title VARCHAR(500) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  compare_at_price DECIMAL(10, 2),
  cost_per_item DECIMAL(10, 2),
  taxable BOOLEAN DEFAULT true,
  weight_value DECIMAL(10, 2),
  weight_unit VARCHAR(10),
  requires_shipping BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_variants_product_id ON variants(product_id);
CREATE INDEX idx_variants_sku ON variants(sku);

-- =====================================================
-- CUSTOMERS
-- =====================================================

CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'disabled', 'invited')),
  email_verified BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  total_spent DECIMAL(10, 2) DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  last_order_at TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_status ON customers(status);

CREATE TABLE IF NOT EXISTS customer_addresses (
  id VARCHAR(255) PRIMARY KEY,
  customer_id VARCHAR(255) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  address1 VARCHAR(500) NOT NULL,
  address2 VARCHAR(500),
  city VARCHAR(255) NOT NULL,
  region VARCHAR(255) NOT NULL,
  postal_code VARCHAR(50) NOT NULL,
  country VARCHAR(10) NOT NULL,
  phone VARCHAR(50),
  is_default BOOLEAN DEFAULT false
);

CREATE INDEX idx_customer_addresses_customer_id ON customer_addresses(customer_id);

-- =====================================================
-- ORDERS
-- =====================================================

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(255) PRIMARY KEY,
  order_number VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  financial_status VARCHAR(50) NOT NULL CHECK (financial_status IN ('pending', 'paid', 'partially_paid', 'refunded', 'voided')),
  fulfillment_status VARCHAR(50) NOT NULL CHECK (fulfillment_status IN ('unfulfilled', 'partially_fulfilled', 'fulfilled', 'cancelled')),
  customer_id VARCHAR(255) REFERENCES customers(id),
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) NOT NULL,
  shipping DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  shipping_address JSONB NOT NULL,
  billing_address JSONB NOT NULL,
  payment_method VARCHAR(100) NOT NULL,
  shipping_method VARCHAR(100) NOT NULL,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

CREATE TABLE IF NOT EXISTS order_items (
  id VARCHAR(255) PRIMARY KEY,
  order_id VARCHAR(255) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id VARCHAR(255) NOT NULL REFERENCES products(id),
  variant_id VARCHAR(255) NOT NULL REFERENCES variants(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  sku VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  variant_title VARCHAR(255),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- =====================================================
-- INVENTORY
-- =====================================================

CREATE TABLE IF NOT EXISTS warehouses (
  id VARCHAR(255) PRIMARY KEY,
  code VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  address JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_warehouses_code ON warehouses(code);
CREATE INDEX idx_warehouses_is_active ON warehouses(is_active);

CREATE TABLE IF NOT EXISTS stock_levels (
  id VARCHAR(255) PRIMARY KEY,
  variant_id VARCHAR(255) NOT NULL REFERENCES variants(id) ON DELETE CASCADE,
  warehouse_id VARCHAR(255) NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  available INTEGER NOT NULL DEFAULT 0,
  reserved INTEGER NOT NULL DEFAULT 0,
  incoming INTEGER NOT NULL DEFAULT 0,
  on_hand INTEGER NOT NULL DEFAULT 0,
  UNIQUE(variant_id, warehouse_id)
);

CREATE INDEX idx_stock_levels_variant_id ON stock_levels(variant_id);
CREATE INDEX idx_stock_levels_warehouse_id ON stock_levels(warehouse_id);

CREATE TABLE IF NOT EXISTS stock_movements (
  id VARCHAR(255) PRIMARY KEY,
  variant_id VARCHAR(255) NOT NULL REFERENCES variants(id) ON DELETE CASCADE,
  warehouse_id VARCHAR(255) NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('purchase', 'sale', 'adjustment', 'transfer', 'return', 'damaged')),
  quantity INTEGER NOT NULL,
  reason VARCHAR(500),
  reference VARCHAR(255),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stock_movements_variant_id ON stock_movements(variant_id);
CREATE INDEX idx_stock_movements_warehouse_id ON stock_movements(warehouse_id);
CREATE INDEX idx_stock_movements_created_at ON stock_movements(created_at DESC);

-- =====================================================
-- POS (Point of Sale)
-- =====================================================

CREATE TABLE IF NOT EXISTS pos_sessions (
  id VARCHAR(255) PRIMARY KEY,
  session_number VARCHAR(255) UNIQUE NOT NULL,
  location_id VARCHAR(255) NOT NULL,
  cashier_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('open', 'closed')),
  opening_cash DECIMAL(10, 2) NOT NULL,
  closing_cash DECIMAL(10, 2),
  expected_cash DECIMAL(10, 2),
  total_sales DECIMAL(10, 2) DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  opened_at TIMESTAMP NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_pos_sessions_status ON pos_sessions(status);
CREATE INDEX idx_pos_sessions_opened_at ON pos_sessions(opened_at DESC);

CREATE TABLE IF NOT EXISTS pos_sales (
  id VARCHAR(255) PRIMARY KEY,
  sale_number VARCHAR(255) UNIQUE NOT NULL,
  session_id VARCHAR(255) NOT NULL REFERENCES pos_sessions(id) ON DELETE CASCADE,
  customer_id VARCHAR(255) REFERENCES customers(id),
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('completed', 'pending', 'cancelled')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pos_sales_session_id ON pos_sales(session_id);
CREATE INDEX idx_pos_sales_created_at ON pos_sales(created_at DESC);

CREATE TABLE IF NOT EXISTS pos_sale_items (
  id VARCHAR(255) PRIMARY KEY,
  sale_id VARCHAR(255) NOT NULL REFERENCES pos_sales(id) ON DELETE CASCADE,
  product_id VARCHAR(255) NOT NULL REFERENCES products(id),
  variant_id VARCHAR(255) NOT NULL REFERENCES variants(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  sku VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL
);

CREATE INDEX idx_pos_sale_items_sale_id ON pos_sale_items(sale_id);

CREATE TABLE IF NOT EXISTS pos_sale_payments (
  id VARCHAR(255) PRIMARY KEY,
  sale_id VARCHAR(255) NOT NULL REFERENCES pos_sales(id) ON DELETE CASCADE,
  method VARCHAR(50) NOT NULL CHECK (method IN ('cash', 'card', 'mobile', 'other')),
  amount DECIMAL(10, 2) NOT NULL,
  reference VARCHAR(255),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_pos_sale_payments_sale_id ON pos_sale_payments(sale_id);

-- =====================================================
-- AUTH (Users & Roles)
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(500) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  last_login_at TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);

CREATE TABLE IF NOT EXISTS roles (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_roles_name ON roles(name);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id VARCHAR(255) NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- =====================================================
-- SHIPPING
-- =====================================================

CREATE TABLE IF NOT EXISTS shipping_zones (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  countries TEXT[] NOT NULL,
  regions TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_shipping_zones_countries ON shipping_zones USING GIN(countries);

CREATE TABLE IF NOT EXISTS shipping_rates (
  id VARCHAR(255) PRIMARY KEY,
  zone_id VARCHAR(255) NOT NULL REFERENCES shipping_zones(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  min_order_value DECIMAL(10, 2),
  max_order_value DECIMAL(10, 2),
  min_weight DECIMAL(10, 2),
  max_weight DECIMAL(10, 2),
  delivery_time VARCHAR(255),
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_shipping_rates_zone_id ON shipping_rates(zone_id);

-- =====================================================
-- TAXES
-- =====================================================

CREATE TABLE IF NOT EXISTS tax_rates (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(10) NOT NULL,
  region VARCHAR(255),
  rate DECIMAL(5, 2) NOT NULL,
  is_compound BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_tax_rates_country ON tax_rates(country);
CREATE INDEX idx_tax_rates_region ON tax_rates(region);

-- =====================================================
-- PROMOTIONS (Coupons & Discounts)
-- =====================================================

CREATE TABLE IF NOT EXISTS coupons (
  id VARCHAR(255) PRIMARY KEY,
  code VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('percentage', 'fixed', 'free_shipping')),
  value DECIMAL(10, 2) NOT NULL,
  min_purchase_amount DECIMAL(10, 2),
  max_discount_amount DECIMAL(10, 2),
  usage_limit INTEGER,
  times_used INTEGER DEFAULT 0,
  starts_at TIMESTAMP,
  ends_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_is_active ON coupons(is_active);

CREATE TABLE IF NOT EXISTS discounts (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('percentage', 'fixed', 'buy_x_get_y', 'free_shipping')),
  value DECIMAL(10, 2) NOT NULL,
  target VARCHAR(50) NOT NULL CHECK (target IN ('order', 'product', 'shipping')),
  target_selection VARCHAR(50) NOT NULL CHECK (target_selection IN ('all', 'specific')),
  product_ids TEXT[],
  collection_ids TEXT[],
  min_purchase_amount DECIMAL(10, 2),
  starts_at TIMESTAMP,
  ends_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1
);

CREATE INDEX idx_discounts_is_active ON discounts(is_active);
CREATE INDEX idx_discounts_priority ON discounts(priority);
