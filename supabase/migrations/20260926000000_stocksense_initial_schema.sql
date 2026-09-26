-- Supabase PostgreSQL Schema Migration for StockSense Inventory Platform
-- Generated for Odoo x GCET Hyderabad Hackathon 2026

-- 1. Profiles & Roles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'INVENTORY_MANAGER' CHECK (role IN ('ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Products
CREATE TABLE IF NOT EXISTS public.products (
  id BIGSERIAL PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category_id BIGINT REFERENCES public.categories(id) ON DELETE SET NULL,
  unit_of_measure TEXT DEFAULT 'pcs',
  description TEXT,
  unit_cost NUMERIC(12, 2) DEFAULT 0.00,
  reorder_level INT DEFAULT 10,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast product search
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);

-- 4. Warehouses
CREATE TABLE IF NOT EXISTS public.warehouses (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  address TEXT,
  manager TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Locations
CREATE TABLE IF NOT EXISTS public.locations (
  id BIGSERIAL PRIMARY KEY,
  warehouse_id BIGINT REFERENCES public.warehouses(id) ON DELETE CASCADE,
  parent_location_id BIGINT REFERENCES public.locations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  type TEXT DEFAULT 'internal',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Suppliers & Customers
CREATE TABLE IF NOT EXISTS public.suppliers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.customers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Inventory Stock
CREATE TABLE IF NOT EXISTS public.inventory (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE,
  warehouse_id BIGINT REFERENCES public.warehouses(id) ON DELETE CASCADE,
  location_id BIGINT REFERENCES public.locations(id) ON DELETE CASCADE,
  quantity INT DEFAULT 0 CHECK (quantity >= 0),
  reserved_quantity INT DEFAULT 0 CHECK (reserved_quantity >= 0),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_product_location UNIQUE (product_id, location_id)
);

-- 8. Receipts
CREATE TABLE IF NOT EXISTS public.receipts (
  id BIGSERIAL PRIMARY KEY,
  receipt_number TEXT UNIQUE NOT NULL,
  supplier_id BIGINT REFERENCES public.suppliers(id) ON DELETE SET NULL,
  warehouse_id BIGINT REFERENCES public.warehouses(id) ON DELETE SET NULL,
  destination_location_id BIGINT REFERENCES public.locations(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'WAITING', 'READY', 'DONE', 'CANCELED')),
  scheduled_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  validated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.receipt_items (
  id BIGSERIAL PRIMARY KEY,
  receipt_id BIGINT REFERENCES public.receipts(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE,
  expected_quantity INT NOT NULL CHECK (expected_quantity > 0),
  received_quantity INT DEFAULT 0,
  unit_cost NUMERIC(12, 2) DEFAULT 0.00
);

-- 9. Deliveries
CREATE TABLE IF NOT EXISTS public.deliveries (
  id BIGSERIAL PRIMARY KEY,
  delivery_number TEXT UNIQUE NOT NULL,
  customer_id BIGINT REFERENCES public.customers(id) ON DELETE SET NULL,
  warehouse_id BIGINT REFERENCES public.warehouses(id) ON DELETE SET NULL,
  source_location_id BIGINT REFERENCES public.locations(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'READY', 'PICKED', 'PACKED', 'DONE', 'CANCELED')),
  scheduled_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  validated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.delivery_items (
  id BIGSERIAL PRIMARY KEY,
  delivery_id BIGINT REFERENCES public.deliveries(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE,
  requested_quantity INT NOT NULL CHECK (requested_quantity > 0),
  picked_quantity INT DEFAULT 0,
  delivered_quantity INT DEFAULT 0
);

-- 10. Transfers
CREATE TABLE IF NOT EXISTS public.transfers (
  id BIGSERIAL PRIMARY KEY,
  transfer_number TEXT UNIQUE NOT NULL,
  source_warehouse_id BIGINT REFERENCES public.warehouses(id) ON DELETE SET NULL,
  source_location_id BIGINT REFERENCES public.locations(id) ON DELETE SET NULL,
  destination_warehouse_id BIGINT REFERENCES public.warehouses(id) ON DELETE SET NULL,
  destination_location_id BIGINT REFERENCES public.locations(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'READY', 'DONE', 'CANCELED')),
  scheduled_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  validated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transfer_items (
  id BIGSERIAL PRIMARY KEY,
  transfer_id BIGINT REFERENCES public.transfers(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INT NOT NULL CHECK (quantity > 0)
);

-- 11. Adjustments
CREATE TABLE IF NOT EXISTS public.adjustments (
  id BIGSERIAL PRIMARY KEY,
  adjustment_number TEXT UNIQUE NOT NULL,
  warehouse_id BIGINT REFERENCES public.warehouses(id) ON DELETE SET NULL,
  location_id BIGINT REFERENCES public.locations(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'DONE', 'CANCELED')),
  reason TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  validated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.adjustment_items (
  id BIGSERIAL PRIMARY KEY,
  adjustment_id BIGINT REFERENCES public.adjustments(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE,
  system_quantity INT NOT NULL,
  physical_quantity INT NOT NULL,
  difference INT NOT NULL
);

-- 12. Stock Movements Audit Ledger
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL,
  reference_type TEXT,
  reference_id TEXT NOT NULL,
  from_warehouse_id BIGINT REFERENCES public.warehouses(id) ON DELETE SET NULL,
  from_location_id BIGINT REFERENCES public.locations(id) ON DELETE SET NULL,
  to_warehouse_id BIGINT REFERENCES public.warehouses(id) ON DELETE SET NULL,
  to_location_id BIGINT REFERENCES public.locations(id) ON DELETE SET NULL,
  quantity INT NOT NULL,
  quantity_before INT NOT NULL DEFAULT 0,
  quantity_after INT NOT NULL DEFAULT 0,
  reason TEXT,
  performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Audit Logs & Notifications
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  before_data JSONB,
  after_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reorder_rules (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE,
  warehouse_id BIGINT REFERENCES public.warehouses(id) ON DELETE CASCADE,
  minimum_quantity INT NOT NULL DEFAULT 10,
  maximum_quantity INT NOT NULL DEFAULT 100,
  reorder_quantity INT GENERATED ALWAYS AS (maximum_quantity - minimum_quantity) STORED,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_reorder_product_warehouse UNIQUE (product_id, warehouse_id)
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read products for authenticated users" ON public.products FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Public read inventory for authenticated users" ON public.inventory FOR SELECT USING (auth.role() = 'authenticated');
