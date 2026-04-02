# OPS Merch Store Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a merch store at `/shop` on ops-site with Supabase catalog, Zustand cart, inline card expansion, and embedded Stripe checkout.

**Architecture:** Server-rendered product catalog (ISR, 5min revalidation) with client-side cart (Zustand + localStorage). Inline card expansion via Framer Motion layout animations. Stepped checkout at `/shop/checkout` with Stripe Elements. Guest-only (no auth). All animations use project easing `[0.22, 1, 0.36, 1]`.

**Tech Stack:** Next.js 16.1.6 (App Router), Tailwind v4, Supabase (shared project), Stripe (Elements + Tax), Zustand 5, Framer Motion 12, Resend (email).

**Spec:** `docs/superpowers/specs/2026-04-02-ops-merch-store-design.md`

**Required skills for execution:** `interface-design`, `frontend-design`, `animation-studio:animation-architect`, `animation-studio:web-animations`, `ops-copywriter`

---

## File Map

### New files

```
src/
├── app/
│   ├── shop/
│   │   ├── page.tsx                    # Store page (server component)
│   │   ├── ShopClient.tsx              # Client wrapper — grid, expansion, filters
│   │   ├── checkout/
│   │   │   └── page.tsx                # Checkout page (server component, loads shipping methods)
│   │   ├── CheckoutClient.tsx          # Client — stepped form, Stripe Elements
│   │   └── confirmation/
│   │       └── page.tsx                # Order confirmation (server component)
│   └── api/
│       └── shop/
│           ├── create-payment-intent/
│           │   └── route.ts            # PaymentIntent creation + inventory reservation
│           ├── confirm-order/
│           │   └── route.ts            # Order confirmation + stock deduction + email
│           └── webhook/
│               └── route.ts            # Stripe webhook handler
├── components/
│   └── shop/
│       ├── FeaturedHero.tsx            # Hero banner for featured product
│       ├── CategoryFilter.tsx          # Pill-style category filter bar
│       ├── ProductGrid.tsx             # Animated 3-col product grid
│       ├── ProductCard.tsx             # Individual product card (collapsed state)
│       ├── ProductExpanded.tsx         # Expanded product detail (inline)
│       ├── OptionSelector.tsx          # Size/color pill selector
│       ├── QuantitySelector.tsx        # −/+/number input
│       ├── CartIcon.tsx                # Nav cart icon with badge
│       ├── CartDrawer.tsx              # Slide-over cart drawer
│       ├── CartItem.tsx                # Single cart item row
│       ├── CheckoutShipping.tsx        # Step 1: shipping form
│       ├── CheckoutPayment.tsx         # Step 2: Stripe Elements
│       ├── OrderSummary.tsx            # Checkout sidebar order summary
│       └── ShippingMethodSelector.tsx  # Radio buttons for shipping methods
├── lib/
│   ├── shop/
│   │   ├── types.ts                    # All shop TypeScript types
│   │   ├── queries.ts                  # Supabase query helpers (server-side)
│   │   └── stripe.ts                   # Stripe server-side helpers
│   └── stores/
│       └── cart.ts                     # Zustand cart store
└── i18n/
    └── dictionaries/
        ├── en/
        │   └── shop.json               # English shop translations
        └── es/
            └── shop.json               # Spanish shop translations
```

### Modified files

```
src/i18n/types.ts                       # Add 'shop' to Namespace union
src/components/layout/Navigation.tsx     # Add SHOP link + CartIcon
src/components/layout/MobileMenu.tsx     # Add SHOP link
src/components/layout/Footer.tsx         # Add Shop link to PRODUCT column
next.config.ts                          # Add Supabase Storage image domain
package.json                            # Add stripe, @stripe/stripe-js, @stripe/react-stripe-js
```

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install Stripe packages**

```bash
cd /Users/jacksonsweet/Projects/OPS/ops-site
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

- [ ] **Step 2: Verify installation**

```bash
cat package.json | grep -E "stripe|@stripe"
```

Expected: `stripe`, `@stripe/stripe-js`, `@stripe/react-stripe-js` all present.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add Stripe packages for merch store"
```

---

## Task 2: Update next.config.ts for Supabase Storage Images

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: Add Supabase Storage hostname**

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cdn.bubble.io',
      },
      {
        protocol: 'https',
        hostname: 'ijeekuhbatykdomumfjx.supabase.co',
      },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 2: Commit**

```bash
git add next.config.ts
git commit -m "config: add Supabase Storage to image remote patterns"
```

---

## Task 3: Add i18n Shop Namespace

**Files:**
- Modify: `src/i18n/types.ts`
- Create: `src/i18n/dictionaries/en/shop.json`
- Create: `src/i18n/dictionaries/es/shop.json`

- [ ] **Step 1: Add 'shop' to the Namespace union type**

```ts
// src/i18n/types.ts
export type Locale = 'en' | 'es';

export type Namespace =
  | 'common'
  | 'home'
  | 'platform'
  | 'plans'
  | 'company'
  | 'resources'
  | 'tools'
  | 'legal'
  | 'shop';

export type Dictionary = Record<string, string | string[] | Record<string, unknown>>;
```

- [ ] **Step 2: Create English shop dictionary**

```json
{
  "hero.label": "NEW DROP",
  "hero.cta": "SHOP NOW",
  "filter.all": "ALL",
  "product.addToCart": "ADD TO CART",
  "product.soldOut": "SOLD OUT",
  "product.onlyXLeft": "Only {count} left",
  "product.size": "SIZE",
  "product.color": "COLOR",
  "product.qty": "QTY",
  "cart.title": "YOUR CART",
  "cart.empty": "Your cart is empty",
  "cart.browse": "BROWSE SHOP",
  "cart.subtotal": "SUBTOTAL",
  "cart.shippingNote": "Shipping calculated at checkout",
  "cart.checkout": "CHECKOUT",
  "checkout.breadcrumb.shop": "Shop",
  "checkout.breadcrumb.checkout": "Checkout",
  "checkout.step.shipping": "SHIPPING",
  "checkout.step.payment": "PAYMENT",
  "checkout.step.confirm": "CONFIRM",
  "checkout.firstName": "FIRST NAME",
  "checkout.lastName": "LAST NAME",
  "checkout.email": "EMAIL",
  "checkout.address1": "ADDRESS",
  "checkout.address2": "APT / SUITE",
  "checkout.city": "CITY",
  "checkout.state": "STATE",
  "checkout.zip": "ZIP",
  "checkout.country": "COUNTRY",
  "checkout.continueToPayment": "CONTINUE TO PAYMENT",
  "checkout.pay": "PAY",
  "checkout.shippingMethod": "SHIPPING METHOD",
  "checkout.freeShipping": "FREE",
  "summary.title": "ORDER SUMMARY",
  "summary.subtotal": "SUBTOTAL",
  "summary.shipping": "SHIPPING",
  "summary.tax": "TAX",
  "summary.total": "TOTAL",
  "confirm.title": "ORDER CONFIRMED",
  "confirm.emailSent": "Confirmation sent to {email}",
  "confirm.shippingTo": "SHIPPING TO",
  "confirm.backToShop": "BACK TO SHOP",
  "meta.title": "OPS Gear — Shop",
  "meta.description": "Rep the brand that runs your business. Apparel, accessories, and drinkware from OPS."
}
```

- [ ] **Step 3: Create Spanish shop dictionary**

```json
{
  "hero.label": "NUEVO",
  "hero.cta": "COMPRAR",
  "filter.all": "TODO",
  "product.addToCart": "AGREGAR AL CARRITO",
  "product.soldOut": "AGOTADO",
  "product.onlyXLeft": "Solo quedan {count}",
  "product.size": "TALLA",
  "product.color": "COLOR",
  "product.qty": "CANT",
  "cart.title": "TU CARRITO",
  "cart.empty": "Tu carrito está vacío",
  "cart.browse": "VER TIENDA",
  "cart.subtotal": "SUBTOTAL",
  "cart.shippingNote": "Envío calculado al pagar",
  "cart.checkout": "PAGAR",
  "checkout.breadcrumb.shop": "Tienda",
  "checkout.breadcrumb.checkout": "Pagar",
  "checkout.step.shipping": "ENVÍO",
  "checkout.step.payment": "PAGO",
  "checkout.step.confirm": "CONFIRMAR",
  "checkout.firstName": "NOMBRE",
  "checkout.lastName": "APELLIDO",
  "checkout.email": "CORREO",
  "checkout.address1": "DIRECCIÓN",
  "checkout.address2": "DEPTO / SUITE",
  "checkout.city": "CIUDAD",
  "checkout.state": "ESTADO",
  "checkout.zip": "CÓDIGO POSTAL",
  "checkout.country": "PAÍS",
  "checkout.continueToPayment": "CONTINUAR AL PAGO",
  "checkout.pay": "PAGAR",
  "checkout.shippingMethod": "MÉTODO DE ENVÍO",
  "checkout.freeShipping": "GRATIS",
  "summary.title": "RESUMEN DEL PEDIDO",
  "summary.subtotal": "SUBTOTAL",
  "summary.shipping": "ENVÍO",
  "summary.tax": "IMPUESTO",
  "summary.total": "TOTAL",
  "confirm.title": "PEDIDO CONFIRMADO",
  "confirm.emailSent": "Confirmación enviada a {email}",
  "confirm.shippingTo": "ENVÍO A",
  "confirm.backToShop": "VOLVER A LA TIENDA",
  "meta.title": "OPS Gear — Tienda",
  "meta.description": "Representa la marca que dirige tu negocio. Ropa, accesorios y más de OPS."
}
```

- [ ] **Step 4: Add nav/footer translation keys to common dictionaries**

Add to `src/i18n/dictionaries/en/common.json`:
```json
"nav.shop": "SHOP",
"footer.shop": "Shop"
```

Add to `src/i18n/dictionaries/es/common.json`:
```json
"nav.shop": "TIENDA",
"footer.shop": "Tienda"
```

- [ ] **Step 5: Commit**

```bash
git add src/i18n/
git commit -m "i18n: add shop namespace and translation dictionaries"
```

---

## Task 4: Create Database Schema

**Files:**
- No file changes — executed via Supabase MCP tool or SQL editor

- [ ] **Step 1: Create all shop tables**

Execute this SQL against the shared Supabase project (`ijeekuhbatykdomumfjx`):

```sql
-- ============================================
-- OPS Merch Store Schema
-- ============================================

-- 1. Categories
CREATE TABLE shop_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Products
CREATE TABLE shop_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES shop_categories(id),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  price_cents int NOT NULL,
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_featured boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  archived_at timestamptz,
  tax_code text NOT NULL DEFAULT 'txcd_99999999',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Product Options (e.g., "Size", "Color")
CREATE TABLE shop_product_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);

-- 4. Option Values (e.g., "M", "L", "Matte Black")
CREATE TABLE shop_product_option_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  option_id uuid NOT NULL REFERENCES shop_product_options(id) ON DELETE CASCADE,
  value text NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);

-- 5. Variants (one per purchasable combination)
CREATE TABLE shop_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE,
  sku text NOT NULL UNIQUE,
  price_cents int NOT NULL,
  stock_quantity int NOT NULL DEFAULT 0,
  reserved_quantity int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0
);

-- 6. Variant ↔ Option Value pivot
CREATE TABLE shop_variant_option_values (
  variant_id uuid NOT NULL REFERENCES shop_variants(id) ON DELETE CASCADE,
  option_value_id uuid NOT NULL REFERENCES shop_product_option_values(id) ON DELETE CASCADE,
  PRIMARY KEY (variant_id, option_value_id)
);

-- 7. Shipping Methods
CREATE TABLE shop_shipping_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price_cents int NOT NULL,
  min_order_cents int,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0
);

-- 8. Orders
CREATE TABLE shop_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  email text NOT NULL,
  shipping_address jsonb NOT NULL,
  shipping_method_id uuid REFERENCES shop_shipping_methods(id),
  subtotal_cents int NOT NULL,
  shipping_cents int NOT NULL,
  tax_cents int NOT NULL,
  total_cents int NOT NULL,
  stripe_payment_intent_id text NOT NULL,
  stripe_tax_calculation_id text,
  status text NOT NULL DEFAULT 'pending',
  paid_at timestamptz,
  shipped_at timestamptz,
  tracking_number text,
  tracking_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 9. Order Items (denormalized snapshots)
CREATE TABLE shop_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES shop_products(id) ON DELETE SET NULL,
  variant_id uuid REFERENCES shop_variants(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  variant_label text NOT NULL,
  sku text NOT NULL,
  image_url text,
  unit_price_cents int NOT NULL,
  quantity int NOT NULL,
  option_values jsonb
);

-- 10. Inventory Reservations (15-min TTL)
CREATE TABLE shop_inventory_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL REFERENCES shop_variants(id) ON DELETE CASCADE,
  quantity int NOT NULL,
  stripe_payment_intent_id text NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '15 minutes'),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_shop_products_category ON shop_products(category_id);
CREATE INDEX idx_shop_products_active ON shop_products(is_active, archived_at);
CREATE INDEX idx_shop_variants_product ON shop_variants(product_id);
CREATE INDEX idx_shop_orders_status ON shop_orders(status);
CREATE INDEX idx_shop_orders_email ON shop_orders(email);
CREATE INDEX idx_shop_order_items_order ON shop_order_items(order_id);
CREATE INDEX idx_shop_reservations_expires ON shop_inventory_reservations(expires_at);

-- Auto-update updated_at trigger for shop_products
CREATE OR REPLACE FUNCTION update_shop_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shop_products_updated_at
  BEFORE UPDATE ON shop_products
  FOR EACH ROW EXECUTE FUNCTION update_shop_products_updated_at();

-- Auto-update updated_at trigger for shop_orders
CREATE OR REPLACE FUNCTION update_shop_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shop_orders_updated_at
  BEFORE UPDATE ON shop_orders
  FOR EACH ROW EXECUTE FUNCTION update_shop_orders_updated_at();

-- RLS: Enable on all tables
ALTER TABLE shop_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_product_option_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_variant_option_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_shipping_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_inventory_reservations ENABLE ROW LEVEL SECURITY;

-- RLS: Public read for catalog tables (anon role)
CREATE POLICY "Public read categories" ON shop_categories FOR SELECT TO anon USING (true);
CREATE POLICY "Public read products" ON shop_products FOR SELECT TO anon USING (is_active = true AND archived_at IS NULL);
CREATE POLICY "Public read options" ON shop_product_options FOR SELECT TO anon USING (true);
CREATE POLICY "Public read option values" ON shop_product_option_values FOR SELECT TO anon USING (true);
CREATE POLICY "Public read variants" ON shop_variants FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "Public read variant options" ON shop_variant_option_values FOR SELECT TO anon USING (true);
CREATE POLICY "Public read shipping" ON shop_shipping_methods FOR SELECT TO anon USING (is_active = true);

-- RLS: Service role has full access (implicit via bypass), no anon writes on orders
CREATE POLICY "Service role orders" ON shop_orders FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role order items" ON shop_order_items FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role reservations" ON shop_inventory_reservations FOR ALL TO service_role USING (true) WITH CHECK (true);
```

- [ ] **Step 2: Seed initial data (shipping methods + test categories)**

```sql
-- Shipping methods
INSERT INTO shop_shipping_methods (name, description, price_cents, min_order_cents, sort_order) VALUES
  ('Standard Shipping', '5-7 business days', 799, NULL, 0),
  ('Free Shipping', '5-7 business days', 0, 7500, 1);

-- Categories
INSERT INTO shop_categories (name, slug, sort_order) VALUES
  ('Apparel', 'apparel', 0),
  ('Accessories', 'accessories', 1),
  ('Drinkware', 'drinkware', 2);
```

- [ ] **Step 3: Verify tables exist**

Run `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'shop_%' ORDER BY table_name;`

Expected: 10 rows (all `shop_*` tables).

---

## Task 5: Create TypeScript Types

**Files:**
- Create: `src/lib/shop/types.ts`

- [ ] **Step 1: Write all shop types**

```ts
// src/lib/shop/types.ts

/**
 * Shop TypeScript types — mirrors Supabase schema.
 * Used by both server queries and client components.
 */

export interface ShopCategory {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

export interface ShopProduct {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  price_cents: number;
  images: string[];
  is_featured: boolean;
  is_active: boolean;
  archived_at: string | null;
  tax_code: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ShopProductOption {
  id: string;
  product_id: string;
  name: string;
  sort_order: number;
}

export interface ShopProductOptionValue {
  id: string;
  option_id: string;
  value: string;
  sort_order: number;
}

export interface ShopVariant {
  id: string;
  product_id: string;
  sku: string;
  price_cents: number;
  stock_quantity: number;
  reserved_quantity: number;
  is_active: boolean;
  sort_order: number;
}

export interface ShopShippingMethod {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  min_order_cents: number | null;
  is_active: boolean;
  sort_order: number;
}

export interface ShopOrder {
  id: string;
  order_number: string;
  email: string;
  shipping_address: ShippingAddress;
  shipping_method_id: string | null;
  subtotal_cents: number;
  shipping_cents: number;
  tax_cents: number;
  total_cents: number;
  stripe_payment_intent_id: string;
  stripe_tax_calculation_id: string | null;
  status: OrderStatus;
  paid_at: string | null;
  shipped_at: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShopOrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  variant_label: string;
  sku: string;
  image_url: string | null;
  unit_price_cents: number;
  quantity: number;
  option_values: Record<string, string> | null;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

// ---------- Composite types (joins) ----------

/** Product with its options, option values, and variants pre-loaded */
export interface ShopProductWithDetails extends ShopProduct {
  category: ShopCategory;
  options: (ShopProductOption & {
    values: ShopProductOptionValue[];
  })[];
  variants: (ShopVariant & {
    option_values: ShopProductOptionValue[];
  })[];
}

/** Order with its items pre-loaded */
export interface ShopOrderWithItems extends ShopOrder {
  items: ShopOrderItem[];
  shipping_method: ShopShippingMethod | null;
}

// ---------- Cart types (client-side) ----------

export interface CartItem {
  productId: string;
  variantId: string;
  productName: string;
  variantLabel: string;
  imageSrc: string;
  priceCents: number;
  quantity: number;
  maxQuantity: number;
}

// ---------- API request/response types ----------

export interface CreatePaymentIntentRequest {
  items: {
    variantId: string;
    quantity: number;
  }[];
  shippingAddress: ShippingAddress;
  shippingMethodId: string;
  email: string;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  orderId: string;
  taxCents: number;
  shippingCents: number;
  totalCents: number;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/shop/types.ts
git commit -m "feat(shop): add TypeScript types for merch store schema"
```

---

## Task 6: Create Supabase Query Helpers

**Files:**
- Create: `src/lib/shop/queries.ts`

- [ ] **Step 1: Write server-side query functions**

```ts
// src/lib/shop/queries.ts

/**
 * Shop data queries — server-side only.
 * Uses getSupabaseAdmin() (service role, bypasses RLS).
 * Called from server components and API routes.
 */

import { getSupabaseAdmin } from '@/lib/supabase-admin';
import type {
  ShopCategory,
  ShopProduct,
  ShopProductOption,
  ShopProductOptionValue,
  ShopVariant,
  ShopProductWithDetails,
  ShopShippingMethod,
  ShopOrderWithItems,
} from './types';

/** Fetch all active categories, sorted */
export async function getCategories(): Promise<ShopCategory[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('shop_categories')
    .select('*')
    .order('sort_order');

  if (error) throw new Error(`Failed to fetch categories: ${error.message}`);
  return data as ShopCategory[];
}

/** Fetch all active, non-archived products with their category */
export async function getProducts(): Promise<(ShopProduct & { category: ShopCategory })[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('shop_products')
    .select('*, category:shop_categories(*)')
    .eq('is_active', true)
    .is('archived_at', null)
    .order('sort_order');

  if (error) throw new Error(`Failed to fetch products: ${error.message}`);
  return data as (ShopProduct & { category: ShopCategory })[];
}

/** Fetch a single product with all its details (options, variants, option values) */
export async function getProductWithDetails(productId: string): Promise<ShopProductWithDetails> {
  const supabase = getSupabaseAdmin();

  // Fetch product + category
  const { data: product, error: productError } = await supabase
    .from('shop_products')
    .select('*, category:shop_categories(*)')
    .eq('id', productId)
    .single();

  if (productError) throw new Error(`Failed to fetch product: ${productError.message}`);

  // Fetch options with their values
  const { data: options, error: optionsError } = await supabase
    .from('shop_product_options')
    .select('*, values:shop_product_option_values(*)')
    .eq('product_id', productId)
    .order('sort_order');

  if (optionsError) throw new Error(`Failed to fetch options: ${optionsError.message}`);

  // Sort option values within each option
  const sortedOptions = (options as (ShopProductOption & { values: ShopProductOptionValue[] })[]).map(opt => ({
    ...opt,
    values: opt.values.sort((a, b) => a.sort_order - b.sort_order),
  }));

  // Fetch variants with their option values via pivot
  const { data: variants, error: variantsError } = await supabase
    .from('shop_variants')
    .select('*, option_values:shop_variant_option_values(option_value_id, shop_product_option_values(*))')
    .eq('product_id', productId)
    .eq('is_active', true)
    .order('sort_order');

  if (variantsError) throw new Error(`Failed to fetch variants: ${variantsError.message}`);

  // Flatten the nested pivot join
  const flattenedVariants = (variants as any[]).map(v => ({
    id: v.id,
    product_id: v.product_id,
    sku: v.sku,
    price_cents: v.price_cents,
    stock_quantity: v.stock_quantity,
    reserved_quantity: v.reserved_quantity,
    is_active: v.is_active,
    sort_order: v.sort_order,
    option_values: v.option_values.map((ov: any) => ov.shop_product_option_values) as ShopProductOptionValue[],
  }));

  return {
    ...product,
    options: sortedOptions,
    variants: flattenedVariants,
  } as ShopProductWithDetails;
}

/** Fetch all products with full details (for the shop page) */
export async function getAllProductsWithDetails(): Promise<ShopProductWithDetails[]> {
  const products = await getProducts();
  const detailed = await Promise.all(
    products.map(p => getProductWithDetails(p.id))
  );
  return detailed;
}

/** Fetch the featured product (most recently updated where is_featured = true) */
export async function getFeaturedProduct(): Promise<ShopProductWithDetails | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('shop_products')
    .select('id')
    .eq('is_featured', true)
    .eq('is_active', true)
    .is('archived_at', null)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch featured product: ${error.message}`);
  if (!data) return null;

  return getProductWithDetails(data.id);
}

/** Fetch active shipping methods */
export async function getShippingMethods(): Promise<ShopShippingMethod[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('shop_shipping_methods')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (error) throw new Error(`Failed to fetch shipping methods: ${error.message}`);
  return data as ShopShippingMethod[];
}

/** Fetch an order with its items by order ID */
export async function getOrderWithItems(orderId: string): Promise<ShopOrderWithItems | null> {
  const supabase = getSupabaseAdmin();

  const { data: order, error: orderError } = await supabase
    .from('shop_orders')
    .select('*, shipping_method:shop_shipping_methods(*)')
    .eq('id', orderId)
    .maybeSingle();

  if (orderError) throw new Error(`Failed to fetch order: ${orderError.message}`);
  if (!order) return null;

  const { data: items, error: itemsError } = await supabase
    .from('shop_order_items')
    .select('*')
    .eq('order_id', orderId);

  if (itemsError) throw new Error(`Failed to fetch order items: ${itemsError.message}`);

  return { ...order, items } as ShopOrderWithItems;
}

/** Generate next order number (OPS-XXXX format) */
export async function generateOrderNumber(): Promise<string> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from('shop_orders')
    .select('*', { count: 'exact', head: true });

  if (error) throw new Error(`Failed to count orders: ${error.message}`);
  const next = (count ?? 0) + 1;
  return `OPS-${String(next).padStart(4, '0')}`;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/shop/queries.ts
git commit -m "feat(shop): add Supabase query helpers for catalog and orders"
```

---

## Task 7: Create Stripe Server Helpers

**Files:**
- Create: `src/lib/shop/stripe.ts`

- [ ] **Step 1: Write Stripe initialization and helpers**

```ts
// src/lib/shop/stripe.ts

/**
 * Stripe server-side helpers.
 * Only used in API routes (server-side).
 */

import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('Missing STRIPE_SECRET_KEY environment variable.');
    _stripe = new Stripe(key);
  }
  return _stripe;
}

/** Format cents to Stripe amount (they're the same, but explicit) */
export function centsToStripeAmount(cents: number): number {
  return Math.round(cents);
}

/** Format cents for display: 6500 → "$65.00" */
export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/shop/stripe.ts
git commit -m "feat(shop): add Stripe server-side initialization helpers"
```

---

## Task 8: Create Zustand Cart Store

**Files:**
- Create: `src/lib/stores/cart.ts`

- [ ] **Step 1: Write the cart store with persist middleware**

```ts
// src/lib/stores/cart.ts

'use client';

/**
 * Cart store — Zustand with localStorage persistence.
 * This is the first Zustand store in ops-site.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/lib/shop/types';

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotalCents: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId);
          if (existing) {
            // Increment quantity, capped at maxQuantity
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: Math.min(i.quantity + (item.quantity || 1), i.maxQuantity) }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: item.quantity || 1 }] };
        }),

      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        })),

      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.variantId === variantId
              ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxQuantity)) }
              : i
          ),
        })),

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotalCents: () => get().items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0),
    }),
    {
      name: 'ops-cart',
    }
  )
);
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/stores/cart.ts
git commit -m "feat(shop): add Zustand cart store with localStorage persistence"
```

---

## Task 9: Update Navigation with Shop Link and Cart Icon

**Files:**
- Create: `src/components/shop/CartIcon.tsx`
- Modify: `src/components/layout/Navigation.tsx`
- Modify: `src/components/layout/Footer.tsx`

- [ ] **Step 1: Create CartIcon component**

```tsx
// src/components/shop/CartIcon.tsx

'use client';

/**
 * CartIcon — Shopping bag icon with animated badge.
 * Badge pops with spring animation when items are added.
 * Muted when cart is empty, white when has items.
 */

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/lib/stores/cart';
import { theme } from '@/lib/theme';

interface CartIconProps {
  onClick: () => void;
  isLight?: boolean;
}

export default function CartIcon({ onClick, isLight = false }: CartIconProps) {
  const totalItems = useCartStore((s) => s.totalItems());
  const hasItems = totalItems > 0;
  const prevCount = useRef(totalItems);

  // Track if count just increased (for pop animation)
  const justAdded = totalItems > prevCount.current;
  useEffect(() => {
    prevCount.current = totalItems;
  }, [totalItems]);

  const iconColor = hasItems
    ? isLight ? '#1A1A1A' : '#FFFFFF'
    : isLight ? 'rgba(26, 26, 26, 0.4)' : 'rgba(255, 255, 255, 0.4)';

  return (
    <button
      onClick={onClick}
      className="relative p-2 cursor-pointer"
      aria-label={`Cart (${totalItems} items)`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke={iconColor}
        strokeWidth="1.5"
        className="transition-colors duration-200"
      >
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
      </svg>

      <AnimatePresence>
        {hasItems && (
          <motion.div
            key={totalItems}
            initial={justAdded ? { scale: 0.5, opacity: 0 } : { scale: 1, opacity: 1 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={
              justAdded
                ? { type: 'spring', stiffness: 500, damping: 15 }
                : { duration: 0.15, ease: theme.animation.easing }
            }
            className="absolute -top-0.5 -right-0.5 bg-white text-ops-background rounded-full flex items-center justify-center"
            style={{
              width: 16,
              height: 16,
              fontSize: 9,
              fontWeight: 700,
              boxShadow: justAdded ? '0 0 8px rgba(255, 255, 255, 0.3)' : 'none',
            }}
          >
            {totalItems}
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
```

- [ ] **Step 2: Add SHOP link and CartIcon to Navigation**

In `src/components/layout/Navigation.tsx`:

Add to the `navLinkKeys` array (after 'tools', before 'plans'):
```ts
const navLinkKeys = [
  { key: 'nav.platform', href: '/platform' },
  { key: 'nav.tools', href: '/tools' },
  { key: 'nav.shop', href: '/shop' },
  { key: 'nav.plans', href: '/plans' },
  { key: 'nav.journal', href: '/journal' },
  { key: 'nav.resources', href: '/resources' },
  { key: 'nav.company', href: '/company' },
];
```

Add imports at the top:
```ts
import CartIcon from '@/components/shop/CartIcon';
import CartDrawer from '@/components/shop/CartDrawer';
```

Add cart drawer state:
```ts
const [cartOpen, setCartOpen] = useState(false);
```

In the right-side desktop section, add CartIcon before the auth/GET OPS button:
```tsx
{/* Right: Cart + Auth state — desktop */}
<div className="hidden lg:flex items-center gap-4">
  <CartIcon
    onClick={() => setCartOpen(true)}
    isLight={isLightPage && !scrolled}
  />
  {user ? (
    // ... existing user dropdown
  ) : (
    // ... existing GET OPS button
  )}
</div>
```

Add CartDrawer before the closing `</>` fragment:
```tsx
<CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
```

- [ ] **Step 3: Add Shop link to Footer**

In `src/components/layout/Footer.tsx`, add to the PRODUCT column links array:
```ts
{ label: t('footer.shop'), href: '/shop' },
```

Place it after `plans` in the PRODUCT column.

- [ ] **Step 4: Commit**

```bash
git add src/components/shop/CartIcon.tsx src/components/layout/Navigation.tsx src/components/layout/Footer.tsx
git commit -m "feat(shop): add cart icon to nav, shop link to nav and footer"
```

---

## Task 10: Build Cart Drawer

**Files:**
- Create: `src/components/shop/CartDrawer.tsx`
- Create: `src/components/shop/CartItem.tsx`

- [ ] **Step 1: Create CartItem component**

```tsx
// src/components/shop/CartItem.tsx

'use client';

import Image from 'next/image';
import { useCartStore } from '@/lib/stores/cart';
import type { CartItem as CartItemType } from '@/lib/shop/types';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const linePrice = item.priceCents * item.quantity;

  return (
    <div className="flex gap-3 py-3 border-b border-white/[0.06]">
      {/* Thumbnail */}
      <div className="w-[50px] h-[50px] bg-ops-surface-elevated rounded-[2px] flex-shrink-0 overflow-hidden relative">
        {item.imageSrc ? (
          <Image
            src={item.imageSrc}
            alt={item.productName}
            fill
            className="object-cover"
            sizes="50px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white/20 text-[7px]">IMG</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-ops-text-primary text-[10px] font-body uppercase tracking-[0.05em] truncate">
              {item.productName}
            </p>
            <p className="text-ops-text-secondary text-[9px] font-caption uppercase tracking-[0.1em] mt-0.5">
              {item.variantLabel}
            </p>
          </div>
          <button
            onClick={() => removeItem(item.variantId)}
            className="text-ops-text-secondary hover:text-ops-text-primary transition-colors text-sm cursor-pointer flex-shrink-0"
            aria-label={`Remove ${item.productName}`}
          >
            ×
          </button>
        </div>

        <div className="flex items-center justify-between mt-2">
          {/* Quantity adjuster */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="border border-ops-border text-ops-text-secondary px-1.5 py-0.5 rounded-[2px] text-[9px] cursor-pointer disabled:opacity-30 hover:border-ops-border-hover transition-colors"
            >
              −
            </button>
            <span className="text-ops-text-primary text-[10px] w-4 text-center">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
              disabled={item.quantity >= item.maxQuantity}
              className="border border-ops-border text-ops-text-secondary px-1.5 py-0.5 rounded-[2px] text-[9px] cursor-pointer disabled:opacity-30 hover:border-ops-border-hover transition-colors"
            >
              +
            </button>
          </div>

          {/* Line price */}
          <span className="text-ops-accent text-[11px]">
            ${(linePrice / 100).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create CartDrawer component**

```tsx
// src/components/shop/CartDrawer.tsx

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/lib/stores/cart';
import CartItem from './CartItem';
import Button from '@/components/ui/Button';
import { theme } from '@/lib/theme';
import Link from 'next/link';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const items = useCartStore((s) => s.items);
  const subtotalCents = useCartStore((s) => s.subtotalCents());
  const isEmpty = items.length === 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: theme.animation.easing }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: theme.animation.easing }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-[400px] bg-ops-surface border-l border-ops-border z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <span className="font-body text-ops-text-primary text-xs uppercase tracking-[0.1em] font-light">
                Your Cart
              </span>
              <button
                onClick={onClose}
                className="text-ops-text-secondary hover:text-ops-text-primary text-lg cursor-pointer transition-colors"
                aria-label="Close cart"
              >
                ×
              </button>
            </div>

            {isEmpty ? (
              /* Empty state */
              <div className="flex-1 flex flex-col items-center justify-center px-5">
                <p className="text-ops-text-secondary text-sm font-body mb-4">
                  Your cart is empty
                </p>
                <Button variant="ghost" onClick={onClose}>
                  Browse Shop
                </Button>
              </div>
            ) : (
              <>
                {/* Item list */}
                <div className="flex-1 overflow-y-auto px-5">
                  {items.map((item) => (
                    <CartItem key={item.variantId} item={item} />
                  ))}
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-ops-border">
                  <div className="flex justify-between mb-1.5">
                    <span className="font-caption uppercase tracking-[0.1em] text-ops-text-secondary text-[9px]">
                      Subtotal
                    </span>
                    <span className="text-ops-text-primary text-[11px]">
                      ${(subtotalCents / 100).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-ops-text-secondary text-[9px] font-caption mb-4">
                    Shipping calculated at checkout
                  </p>
                  <Link
                    href="/shop/checkout"
                    onClick={onClose}
                    className="block w-full bg-ops-text-primary text-ops-background text-center py-3 rounded-[3px] font-caption uppercase tracking-[0.15em] text-xs hover:bg-white/90 active:bg-white/80 transition-all"
                  >
                    Checkout
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/shop/CartDrawer.tsx src/components/shop/CartItem.tsx
git commit -m "feat(shop): build cart drawer with item list, qty adjustment, and checkout link"
```

---

## Task 11: Build Shop Page Components — FeaturedHero, CategoryFilter, ProductCard

**Files:**
- Create: `src/components/shop/FeaturedHero.tsx`
- Create: `src/components/shop/CategoryFilter.tsx`
- Create: `src/components/shop/ProductCard.tsx`

- [ ] **Step 1: Create FeaturedHero**

```tsx
// src/components/shop/FeaturedHero.tsx

'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { theme } from '@/lib/theme';
import type { ShopProductWithDetails } from '@/lib/shop/types';

interface FeaturedHeroProps {
  product: ShopProductWithDetails;
  onShopNow: () => void;
}

export default function FeaturedHero({ product, onShopNow }: FeaturedHeroProps) {
  const primaryImage = product.images[0];
  const displayPrice = product.variants.length > 0
    ? Math.min(...product.variants.map(v => v.price_cents))
    : product.price_cents;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: theme.animation.easing }}
      className="bg-ops-surface border border-ops-border rounded-[3px] overflow-hidden mb-12"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Left: Product image */}
        <div className="bg-ops-surface-elevated relative aspect-square md:aspect-auto md:min-h-[320px]">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 border-2 border-white/15 rounded-[2px] flex items-center justify-center">
                <span className="text-white/30 text-[10px]">IMG</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Product info */}
        <div className="flex flex-col justify-center p-8 md:p-12">
          <span className="font-caption uppercase tracking-[0.15em] text-[9px] text-ops-accent mb-3">
            New Drop
          </span>
          <h2 className="font-heading text-ops-text-primary text-2xl md:text-3xl font-light uppercase tracking-[0.05em] mb-2">
            {product.name}
          </h2>
          {product.description && (
            <p className="text-ops-text-secondary text-sm font-body font-light leading-relaxed mb-6">
              {product.description}
            </p>
          )}
          <button
            onClick={onShopNow}
            className="inline-flex items-center justify-center bg-ops-text-primary text-ops-background px-6 py-3 rounded-[3px] font-caption uppercase tracking-[0.15em] text-xs hover:bg-white/90 active:bg-white/80 transition-all cursor-pointer w-fit"
          >
            Shop Now — ${(displayPrice / 100).toFixed(2)}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Create CategoryFilter**

```tsx
// src/components/shop/CategoryFilter.tsx

'use client';

import { motion } from 'framer-motion';
import { theme } from '@/lib/theme';
import type { ShopCategory } from '@/lib/shop/types';

interface CategoryFilterProps {
  categories: ShopCategory[];
  activeSlug: string | null; // null = "All"
  onSelect: (slug: string | null) => void;
}

export default function CategoryFilter({ categories, activeSlug, onSelect }: CategoryFilterProps) {
  const pills = [
    { slug: null, label: 'All' },
    ...categories.map((c) => ({ slug: c.slug, label: c.name })),
  ];

  return (
    <div className="flex flex-wrap justify-center gap-3 mb-10">
      {pills.map((pill) => {
        const isActive = pill.slug === activeSlug;
        return (
          <button
            key={pill.slug ?? 'all'}
            onClick={() => onSelect(pill.slug)}
            className={`
              relative font-caption uppercase tracking-[0.15em] text-[10px] px-4 py-1.5 rounded-[2px] transition-all duration-200 cursor-pointer
              ${isActive
                ? 'bg-ops-text-primary text-ops-background'
                : 'bg-transparent text-ops-text-secondary border border-ops-border hover:border-ops-border-hover hover:text-ops-text-primary'
              }
            `}
          >
            {pill.label}
            {isActive && (
              <motion.div
                layoutId="category-pill-active"
                className="absolute inset-0 bg-ops-text-primary rounded-[2px] -z-10"
                transition={{ duration: 0.3, ease: theme.animation.easing }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Create ProductCard**

```tsx
// src/components/shop/ProductCard.tsx

'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import type { ShopProductWithDetails } from '@/lib/shop/types';

interface ProductCardProps {
  product: ShopProductWithDetails;
  onClick: () => void;
  index: number; // for staggered entrance
}

export default function ProductCard({ product, onClick, index }: ProductCardProps) {
  const primaryImage = product.images[0];
  const displayPrice = product.variants.length > 0
    ? Math.min(...product.variants.map(v => v.price_cents))
    : product.price_cents;

  return (
    <motion.div
      layout
      layoutId={`product-card-${product.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{
        layout: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
        opacity: { duration: 0.4, delay: index * 0.05 },
        y: { duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] },
      }}
      onClick={onClick}
      className="bg-ops-surface border border-ops-border rounded-[3px] overflow-hidden cursor-pointer transition-all duration-300 hover:border-ops-border-hover hover:-translate-y-1"
    >
      {/* Image area */}
      <div className="bg-ops-surface-elevated aspect-square relative">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 border-2 border-white/15 rounded-[2px] flex items-center justify-center">
              <span className="text-white/30 text-[10px]">IMG</span>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-ops-text-primary text-[11px] font-body uppercase tracking-[0.05em] truncate">
          {product.name}
        </p>
        <p className="text-ops-accent text-[11px] mt-0.5">
          ${(displayPrice / 100).toFixed(2)}
        </p>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/shop/FeaturedHero.tsx src/components/shop/CategoryFilter.tsx src/components/shop/ProductCard.tsx
git commit -m "feat(shop): build hero banner, category filter, and product card components"
```

---

## Task 12: Build Product Expanded View (Inline Card Expansion)

**Files:**
- Create: `src/components/shop/ProductExpanded.tsx`
- Create: `src/components/shop/OptionSelector.tsx`
- Create: `src/components/shop/QuantitySelector.tsx`

- [ ] **Step 1: Create OptionSelector**

```tsx
// src/components/shop/OptionSelector.tsx

'use client';

import type { ShopProductOptionValue } from '@/lib/shop/types';

interface OptionSelectorProps {
  label: string; // "Size", "Color"
  values: ShopProductOptionValue[];
  selectedId: string | null;
  disabledIds: Set<string>; // out-of-stock
  onSelect: (valueId: string) => void;
}

export default function OptionSelector({ label, values, selectedId, disabledIds, onSelect }: OptionSelectorProps) {
  return (
    <div className="mb-4">
      <span className="font-caption uppercase tracking-[0.15em] text-[8px] text-ops-text-secondary block mb-2">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {values.map((v) => {
          const isSelected = v.id === selectedId;
          const isDisabled = disabledIds.has(v.id);
          return (
            <button
              key={v.id}
              onClick={() => !isDisabled && onSelect(v.id)}
              disabled={isDisabled}
              className={`
                px-3 py-1.5 rounded-[2px] text-[9px] font-caption uppercase tracking-[0.1em] transition-all cursor-pointer
                ${isSelected
                  ? 'border border-white text-ops-text-primary'
                  : isDisabled
                    ? 'border border-ops-border text-ops-text-secondary/30 line-through cursor-not-allowed'
                    : 'border border-ops-border text-ops-text-secondary hover:border-ops-border-hover hover:text-ops-text-primary'
                }
              `}
            >
              {v.value}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create QuantitySelector**

```tsx
// src/components/shop/QuantitySelector.tsx

'use client';

interface QuantitySelectorProps {
  quantity: number;
  max: number;
  onChange: (qty: number) => void;
}

export default function QuantitySelector({ quantity, max, onChange }: QuantitySelectorProps) {
  return (
    <div className="mb-5">
      <span className="font-caption uppercase tracking-[0.15em] text-[8px] text-ops-text-secondary block mb-2">
        Qty
      </span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(1, quantity - 1))}
          disabled={quantity <= 1}
          className="border border-ops-border text-ops-text-secondary px-2.5 py-1 rounded-[2px] text-xs cursor-pointer disabled:opacity-30 hover:border-ops-border-hover transition-colors"
        >
          −
        </button>
        <span className="text-ops-text-primary text-sm w-6 text-center">{quantity}</span>
        <button
          onClick={() => onChange(Math.min(max, quantity + 1))}
          disabled={quantity >= max}
          className="border border-ops-border text-ops-text-secondary px-2.5 py-1 rounded-[2px] text-xs cursor-pointer disabled:opacity-30 hover:border-ops-border-hover transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create ProductExpanded**

```tsx
// src/components/shop/ProductExpanded.tsx

'use client';

import { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { theme } from '@/lib/theme';
import { useCartStore } from '@/lib/stores/cart';
import OptionSelector from './OptionSelector';
import QuantitySelector from './QuantitySelector';
import type { ShopProductWithDetails, ShopProductOptionValue } from '@/lib/shop/types';

interface ProductExpandedProps {
  product: ShopProductWithDetails;
  onClose: () => void;
}

export default function ProductExpanded({ product, onClose }: ProductExpandedProps) {
  const addItem = useCartStore((s) => s.addItem);

  // Track selected option values: { optionId: selectedValueId }
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    // Default: first value of each option
    const defaults: Record<string, string> = {};
    for (const opt of product.options) {
      if (opt.values.length > 0) {
        defaults[opt.id] = opt.values[0].id;
      }
    }
    return defaults;
  });

  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [addedFeedback, setAddedFeedback] = useState(false);

  // Find the variant matching current selections
  const selectedVariant = useMemo(() => {
    const selectedValueIds = new Set(Object.values(selectedOptions));
    return product.variants.find((v) =>
      v.option_values.length === selectedValueIds.size &&
      v.option_values.every((ov) => selectedValueIds.has(ov.id))
    ) ?? null;
  }, [product.variants, selectedOptions]);

  const availableStock = selectedVariant
    ? selectedVariant.stock_quantity - selectedVariant.reserved_quantity
    : 0;

  const isSoldOut = availableStock <= 0;
  const isLowStock = availableStock > 0 && availableStock <= 3;

  const displayPrice = selectedVariant?.price_cents ?? product.price_cents;

  // Build the variant label from selected option values
  const variantLabel = useMemo(() => {
    return product.options
      .map((opt) => {
        const valueId = selectedOptions[opt.id];
        const value = opt.values.find((v) => v.id === valueId);
        return value?.value ?? '';
      })
      .filter(Boolean)
      .join(' / ');
  }, [product.options, selectedOptions]);

  // Determine which option values are out of stock
  const getDisabledIds = useCallback((optionId: string): Set<string> => {
    const disabled = new Set<string>();
    const option = product.options.find(o => o.id === optionId);
    if (!option) return disabled;

    for (const value of option.values) {
      // Check if any variant with this value has stock
      const testSelections = { ...selectedOptions, [optionId]: value.id };
      const testValueIds = new Set(Object.values(testSelections));
      const matchingVariant = product.variants.find((v) =>
        v.option_values.length === testValueIds.size &&
        v.option_values.every((ov) => testValueIds.has(ov.id))
      );
      if (!matchingVariant || (matchingVariant.stock_quantity - matchingVariant.reserved_quantity) <= 0) {
        disabled.add(value.id);
      }
    }
    return disabled;
  }, [product.options, product.variants, selectedOptions]);

  const handleAddToCart = () => {
    if (!selectedVariant || isSoldOut) return;
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      productName: product.name,
      variantLabel,
      imageSrc: product.images[0] ?? '',
      priceCents: selectedVariant.price_cents,
      quantity,
      maxQuantity: availableStock,
    });
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1200);
  };

  return (
    <motion.div
      layout
      layoutId={`product-card-${product.id}`}
      className="bg-ops-surface border border-white/15 rounded-[3px] overflow-hidden col-span-full"
      transition={{ layout: { duration: 0.4, ease: theme.animation.easing } }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Left: Image gallery */}
        <div className="bg-ops-surface-elevated p-6 flex flex-col gap-3">
          <div className="relative aspect-square rounded-[2px] overflow-hidden">
            {product.images[activeImageIndex] ? (
              <Image
                src={product.images[activeImageIndex]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 border-2 border-white/15 rounded-[2px] flex items-center justify-center">
                  <span className="text-white/30 text-[10px]">IMG</span>
                </div>
              </div>
            )}
          </div>
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIndex(i)}
                  className={`
                    w-11 h-11 rounded-[2px] overflow-hidden relative cursor-pointer flex-shrink-0
                    border ${i === activeImageIndex ? 'border-ops-accent' : 'border-ops-border hover:border-ops-border-hover'}
                    transition-colors
                  `}
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="44px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product details */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.2, ease: theme.animation.easing }}
          className="p-6 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <span className="font-caption uppercase tracking-[0.15em] text-[9px] text-ops-accent">
              {product.category.name}
            </span>
            <button
              onClick={onClose}
              className="text-ops-text-secondary hover:text-ops-text-primary text-lg cursor-pointer transition-colors -mt-1"
              aria-label="Close product detail"
            >
              ×
            </button>
          </div>

          <h3 className="font-heading text-ops-text-primary text-lg font-light uppercase tracking-[0.05em] mb-1">
            {product.name}
          </h3>
          <p className="text-ops-accent text-sm mb-3">
            ${(displayPrice / 100).toFixed(2)}
          </p>
          {product.description && (
            <p className="text-ops-text-secondary text-[10px] font-body leading-[1.7] mb-5">
              {product.description}
            </p>
          )}

          {/* Option selectors */}
          {product.options.map((opt) => (
            <OptionSelector
              key={opt.id}
              label={opt.name}
              values={opt.values}
              selectedId={selectedOptions[opt.id] ?? null}
              disabledIds={getDisabledIds(opt.id)}
              onSelect={(valueId) =>
                setSelectedOptions((prev) => ({ ...prev, [opt.id]: valueId }))
              }
            />
          ))}

          {/* Quantity */}
          {!isSoldOut && (
            <QuantitySelector
              quantity={quantity}
              max={availableStock}
              onChange={setQuantity}
            />
          )}

          {/* Low stock warning */}
          {isLowStock && (
            <p className="text-ops-text-secondary text-[9px] font-caption mb-3">
              Only {availableStock} left
            </p>
          )}

          {/* Add to Cart */}
          <div className="mt-auto">
            <button
              onClick={handleAddToCart}
              disabled={isSoldOut || !selectedVariant}
              className={`
                w-full py-3 rounded-[2px] font-caption uppercase tracking-[0.15em] text-xs transition-all cursor-pointer
                ${isSoldOut || !selectedVariant
                  ? 'bg-ops-surface-elevated text-ops-text-secondary/50 cursor-not-allowed'
                  : addedFeedback
                    ? 'bg-ops-accent text-white'
                    : 'bg-ops-text-primary text-ops-background hover:bg-white/90 active:bg-white/80'
                }
              `}
            >
              {isSoldOut
                ? 'Sold Out'
                : addedFeedback
                  ? '✓'
                  : `Add to Cart — $${(displayPrice * quantity / 100).toFixed(2)}`
              }
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/shop/ProductExpanded.tsx src/components/shop/OptionSelector.tsx src/components/shop/QuantitySelector.tsx
git commit -m "feat(shop): build inline card expansion with option selection, stock tracking, and add-to-cart"
```

---

## Task 13: Build Shop Page (Server + Client)

**Files:**
- Create: `src/app/shop/page.tsx`
- Create: `src/app/shop/ShopClient.tsx`
- Create: `src/components/shop/ProductGrid.tsx`

- [ ] **Step 1: Create ProductGrid (orchestrates cards + expansion)**

```tsx
// src/components/shop/ProductGrid.tsx

'use client';

import { useState } from 'react';
import { AnimatePresence, LayoutGroup } from 'framer-motion';
import ProductCard from './ProductCard';
import ProductExpanded from './ProductExpanded';
import type { ShopProductWithDetails } from '@/lib/shop/types';

interface ProductGridProps {
  products: ShopProductWithDetails[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <LayoutGroup>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {products.map((product, index) =>
            expandedId === product.id ? (
              <ProductExpanded
                key={`expanded-${product.id}`}
                product={product}
                onClose={() => setExpandedId(null)}
              />
            ) : (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => setExpandedId(product.id)}
                index={index}
              />
            )
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}
```

- [ ] **Step 2: Create ShopClient (category filter + grid + hero interaction)**

```tsx
// src/app/shop/ShopClient.tsx

'use client';

import { useState, useMemo, useRef } from 'react';
import FeaturedHero from '@/components/shop/FeaturedHero';
import CategoryFilter from '@/components/shop/CategoryFilter';
import ProductGrid from '@/components/shop/ProductGrid';
import type { ShopCategory, ShopProductWithDetails } from '@/lib/shop/types';

interface ShopClientProps {
  categories: ShopCategory[];
  products: ShopProductWithDetails[];
  featuredProduct: ShopProductWithDetails | null;
}

export default function ShopClient({ categories, products, featuredProduct }: ShopClientProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const filteredProducts = useMemo(() => {
    if (!activeCategory) return products;
    return products.filter((p) => p.category.slug === activeCategory);
  }, [products, activeCategory]);

  const scrollToGrid = () => {
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="pt-24 pb-20 px-6 md:px-10 max-w-[1400px] mx-auto">
      {/* Featured hero */}
      {featuredProduct && (
        <FeaturedHero product={featuredProduct} onShopNow={scrollToGrid} />
      )}

      {/* Category filters + Grid */}
      <div ref={gridRef}>
        <CategoryFilter
          categories={categories}
          activeSlug={activeCategory}
          onSelect={setActiveCategory}
        />
        <ProductGrid products={filteredProducts} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create shop page (server component)**

```tsx
// src/app/shop/page.tsx

import { Metadata } from 'next';
import ShopClient from './ShopClient';
import { getCategories, getAllProductsWithDetails, getFeaturedProduct } from '@/lib/shop/queries';

export const revalidate = 300; // ISR: 5-minute cache

export const metadata: Metadata = {
  title: 'OPS Gear — Shop',
  description: 'Rep the brand that runs your business. Apparel, accessories, and drinkware from OPS.',
  openGraph: {
    title: 'OPS Gear — Shop',
    description: 'Rep the brand that runs your business.',
  },
};

export default async function ShopPage() {
  const [categories, products, featuredProduct] = await Promise.all([
    getCategories(),
    getAllProductsWithDetails(),
    getFeaturedProduct(),
  ]);

  return (
    <ShopClient
      categories={categories}
      products={products}
      featuredProduct={featuredProduct}
    />
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/shop/ src/components/shop/ProductGrid.tsx
git commit -m "feat(shop): build shop page with server data fetching, category filters, and product grid"
```

---

## Task 14: Build Checkout Page — Shipping Step

**Files:**
- Create: `src/components/shop/CheckoutShipping.tsx`
- Create: `src/components/shop/ShippingMethodSelector.tsx`
- Create: `src/components/shop/OrderSummary.tsx`

- [ ] **Step 1: Create OrderSummary sidebar**

```tsx
// src/components/shop/OrderSummary.tsx

'use client';

import Image from 'next/image';
import { useCartStore } from '@/lib/stores/cart';

interface OrderSummaryProps {
  shippingCents?: number;
  taxCents?: number;
}

export default function OrderSummary({ shippingCents, taxCents }: OrderSummaryProps) {
  const items = useCartStore((s) => s.items);
  const subtotalCents = useCartStore((s) => s.subtotalCents());
  const totalCents = subtotalCents + (shippingCents ?? 0) + (taxCents ?? 0);

  return (
    <div className="bg-ops-surface border border-white/[0.06] rounded-[3px] p-5 sticky top-24">
      <span className="font-caption uppercase tracking-[0.1em] text-ops-text-primary text-[10px] block mb-4">
        Order Summary
      </span>

      {/* Items */}
      {items.map((item) => (
        <div key={item.variantId} className="flex gap-2.5 py-2.5 border-b border-white/[0.06]">
          <div className="w-10 h-10 bg-ops-surface-elevated rounded-[2px] flex-shrink-0 overflow-hidden relative">
            {item.imageSrc ? (
              <Image src={item.imageSrc} alt="" fill className="object-cover" sizes="40px" />
            ) : (
              <div className="w-full h-full" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-ops-text-primary text-[9px] font-body uppercase truncate">{item.productName}</p>
            <p className="text-ops-text-secondary text-[8px] font-caption mt-0.5">
              {item.variantLabel} × {item.quantity}
            </p>
          </div>
          <span className="text-ops-accent text-[10px] flex-shrink-0">
            ${((item.priceCents * item.quantity) / 100).toFixed(2)}
          </span>
        </div>
      ))}

      {/* Totals */}
      <div className="pt-3 space-y-1.5">
        <div className="flex justify-between">
          <span className="font-caption uppercase tracking-[0.1em] text-ops-text-secondary text-[9px]">Subtotal</span>
          <span className="text-ops-text-primary text-[10px]">${(subtotalCents / 100).toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-caption uppercase tracking-[0.1em] text-ops-text-secondary text-[9px]">Shipping</span>
          <span className="text-ops-text-secondary text-[10px]">
            {shippingCents != null ? `$${(shippingCents / 100).toFixed(2)}` : '—'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-caption uppercase tracking-[0.1em] text-ops-text-secondary text-[9px]">Tax</span>
          <span className="text-ops-text-secondary text-[10px]">
            {taxCents != null ? `$${(taxCents / 100).toFixed(2)}` : '—'}
          </span>
        </div>
        <div className="flex justify-between pt-2 border-t border-ops-border">
          <span className="font-caption uppercase tracking-[0.1em] text-ops-text-primary text-[10px]">Total</span>
          <span className="text-ops-text-primary text-[13px]">${(totalCents / 100).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create ShippingMethodSelector**

```tsx
// src/components/shop/ShippingMethodSelector.tsx

'use client';

import type { ShopShippingMethod } from '@/lib/shop/types';

interface ShippingMethodSelectorProps {
  methods: ShopShippingMethod[];
  selectedId: string | null;
  subtotalCents: number;
  onSelect: (id: string) => void;
}

export default function ShippingMethodSelector({ methods, selectedId, subtotalCents, onSelect }: ShippingMethodSelectorProps) {
  return (
    <div className="mb-6">
      <span className="font-caption uppercase tracking-[0.15em] text-[8px] text-ops-text-secondary block mb-3">
        Shipping Method
      </span>
      <div className="space-y-2">
        {methods.map((method) => {
          const isFree = method.min_order_cents != null && subtotalCents >= method.min_order_cents;
          const effectivePrice = isFree ? 0 : method.price_cents;
          // Hide "Free Shipping" option if subtotal doesn't qualify
          if (method.price_cents === 0 && method.min_order_cents != null && subtotalCents < method.min_order_cents) {
            return null;
          }

          return (
            <label
              key={method.id}
              className={`
                flex items-center gap-3 p-3 rounded-[2px] border cursor-pointer transition-colors
                ${selectedId === method.id
                  ? 'border-white/25 bg-ops-surface-elevated'
                  : 'border-ops-border hover:border-ops-border-hover'
                }
              `}
            >
              <input
                type="radio"
                name="shipping-method"
                value={method.id}
                checked={selectedId === method.id}
                onChange={() => onSelect(method.id)}
                className="accent-white"
              />
              <div className="flex-1">
                <p className="text-ops-text-primary text-[10px] font-body uppercase tracking-[0.05em]">
                  {method.name}
                </p>
                {method.description && (
                  <p className="text-ops-text-secondary text-[9px] mt-0.5">{method.description}</p>
                )}
              </div>
              <span className="text-ops-accent text-[10px]">
                {effectivePrice === 0 ? 'Free' : `$${(effectivePrice / 100).toFixed(2)}`}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create CheckoutShipping form**

```tsx
// src/components/shop/CheckoutShipping.tsx

'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/stores/cart';
import ShippingMethodSelector from './ShippingMethodSelector';
import type { ShippingAddress, ShopShippingMethod } from '@/lib/shop/types';

interface CheckoutShippingProps {
  shippingMethods: ShopShippingMethod[];
  onContinue: (address: ShippingAddress, email: string, shippingMethodId: string) => void;
  isLoading: boolean;
}

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY',
  'LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND',
  'OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
];

export default function CheckoutShipping({ shippingMethods, onContinue, isLoading }: CheckoutShippingProps) {
  const subtotalCents = useCartStore((s) => s.subtotalCents());
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    zip: '',
  });
  const [shippingMethodId, setShippingMethodId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = 'Required';
    if (!form.lastName.trim()) errs.lastName = 'Required';
    if (!form.email.trim() || !form.email.includes('@')) errs.email = 'Valid email required';
    if (!form.line1.trim()) errs.line1 = 'Required';
    if (!form.city.trim()) errs.city = 'Required';
    if (!form.state) errs.state = 'Required';
    if (!form.zip.trim() || !/^\d{5}(-\d{4})?$/.test(form.zip.trim())) errs.zip = 'Valid ZIP required';
    if (!shippingMethodId) errs.shippingMethod = 'Select a shipping method';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !shippingMethodId) return;
    onContinue(
      {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        line1: form.line1.trim(),
        line2: form.line2.trim() || null,
        city: form.city.trim(),
        state: form.state,
        zip: form.zip.trim(),
        country: 'US',
      },
      form.email.trim().toLowerCase(),
      shippingMethodId
    );
  };

  const inputClass = (field: string) => `
    w-full bg-ops-surface-elevated border ${errors[field] ? 'border-red-500/50' : 'border-ops-border'}
    rounded-[2px] px-3 py-2.5 text-ops-text-primary text-sm font-body
    focus:outline-none focus:border-ops-border-hover transition-colors
    placeholder:text-ops-text-secondary/30
  `;

  const labelClass = 'font-caption uppercase tracking-[0.15em] text-[8px] text-ops-text-secondary block mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>First Name</label>
          <input
            type="text"
            value={form.firstName}
            onChange={(e) => update('firstName', e.target.value)}
            className={inputClass('firstName')}
          />
        </div>
        <div>
          <label className={labelClass}>Last Name</label>
          <input
            type="text"
            value={form.lastName}
            onChange={(e) => update('lastName', e.target.value)}
            className={inputClass('lastName')}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          className={inputClass('email')}
        />
      </div>

      <div>
        <label className={labelClass}>Address</label>
        <input
          type="text"
          value={form.line1}
          onChange={(e) => update('line1', e.target.value)}
          className={inputClass('line1')}
        />
      </div>

      <div>
        <label className={labelClass}>Apt / Suite</label>
        <input
          type="text"
          value={form.line2}
          onChange={(e) => update('line2', e.target.value)}
          className={inputClass('line2')}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1">
          <label className={labelClass}>City</label>
          <input
            type="text"
            value={form.city}
            onChange={(e) => update('city', e.target.value)}
            className={inputClass('city')}
          />
        </div>
        <div>
          <label className={labelClass}>State</label>
          <select
            value={form.state}
            onChange={(e) => update('state', e.target.value)}
            className={inputClass('state')}
          >
            <option value="">—</option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>ZIP</label>
          <input
            type="text"
            value={form.zip}
            onChange={(e) => update('zip', e.target.value)}
            className={inputClass('zip')}
          />
        </div>
      </div>

      <ShippingMethodSelector
        methods={shippingMethods}
        selectedId={shippingMethodId}
        subtotalCents={subtotalCents}
        onSelect={setShippingMethodId}
      />

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-ops-text-primary text-ops-background py-3 rounded-[3px] font-caption uppercase tracking-[0.15em] text-xs hover:bg-white/90 active:bg-white/80 transition-all cursor-pointer disabled:opacity-50"
      >
        {isLoading ? 'Processing...' : 'Continue to Payment'}
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/shop/CheckoutShipping.tsx src/components/shop/ShippingMethodSelector.tsx src/components/shop/OrderSummary.tsx
git commit -m "feat(shop): build checkout shipping form, shipping method selector, and order summary"
```

---

## Task 15: Build API Route — Create Payment Intent

**Files:**
- Create: `src/app/api/shop/create-payment-intent/route.ts`

- [ ] **Step 1: Write the payment intent route**

```ts
// src/app/api/shop/create-payment-intent/route.ts

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getStripe } from '@/lib/shop/stripe';
import { generateOrderNumber } from '@/lib/shop/queries';
import type { CreatePaymentIntentRequest, ShopVariant, ShopProduct } from '@/lib/shop/types';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreatePaymentIntentRequest;
    const { items, shippingAddress, shippingMethodId, email } = body;

    if (!items?.length || !shippingAddress || !shippingMethodId || !email) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const stripe = getStripe();

    // 1. Validate variants and check stock
    const variantIds = items.map((i) => i.variantId);
    const { data: variants, error: variantsError } = await supabase
      .from('shop_variants')
      .select('*, product:shop_products(*)')
      .in('id', variantIds);

    if (variantsError || !variants) {
      return NextResponse.json({ error: 'Failed to validate cart items.' }, { status: 500 });
    }

    const variantMap = new Map(variants.map((v: any) => [v.id, v]));

    // Check stock for each item
    for (const item of items) {
      const variant = variantMap.get(item.variantId) as (ShopVariant & { product: ShopProduct }) | undefined;
      if (!variant) {
        return NextResponse.json({ error: `Variant ${item.variantId} not found.` }, { status: 400 });
      }
      const available = variant.stock_quantity - variant.reserved_quantity;
      if (available < item.quantity) {
        return NextResponse.json({
          error: `Insufficient stock for ${variant.product.name}. Available: ${available}.`,
        }, { status: 409 });
      }
    }

    // 2. Reserve inventory
    for (const item of items) {
      // Insert reservation
      await supabase.from('shop_inventory_reservations').insert({
        variant_id: item.variantId,
        quantity: item.quantity,
        stripe_payment_intent_id: 'pending', // updated after PI creation
      });

      // Increment reserved_quantity
      const variant = variantMap.get(item.variantId)!;
      await supabase
        .from('shop_variants')
        .update({ reserved_quantity: (variant as ShopVariant).reserved_quantity + item.quantity })
        .eq('id', item.variantId);
    }

    // 3. Fetch shipping method
    const { data: shippingMethod } = await supabase
      .from('shop_shipping_methods')
      .select('*')
      .eq('id', shippingMethodId)
      .single();

    if (!shippingMethod) {
      return NextResponse.json({ error: 'Invalid shipping method.' }, { status: 400 });
    }

    // 4. Calculate subtotal
    let subtotalCents = 0;
    for (const item of items) {
      const variant = variantMap.get(item.variantId) as ShopVariant;
      subtotalCents += variant.price_cents * item.quantity;
    }

    // Determine shipping cost (free if qualifies)
    const shippingCents =
      shippingMethod.min_order_cents != null && subtotalCents >= shippingMethod.min_order_cents
        ? 0
        : shippingMethod.price_cents;

    // 5. Calculate tax via Stripe Tax (or estimate at 0 for now if Tax not configured)
    // For MVP: we'll add tax_cents = 0 and note this needs Stripe Tax setup
    const taxCents = 0; // TODO: integrate Stripe Tax after account configuration

    const totalCents = subtotalCents + shippingCents + taxCents;

    // 6. Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: 'usd',
      metadata: {
        source: 'ops-merch-store',
        email,
      },
    });

    // Update reservations with actual PI ID
    for (const item of items) {
      await supabase
        .from('shop_inventory_reservations')
        .update({ stripe_payment_intent_id: paymentIntent.id })
        .eq('variant_id', item.variantId)
        .eq('stripe_payment_intent_id', 'pending');
    }

    // 7. Create order
    const orderNumber = await generateOrderNumber();

    const orderItems = items.map((item) => {
      const variant = variantMap.get(item.variantId) as any;
      return {
        product_id: variant.product.id,
        variant_id: variant.id,
        product_name: variant.product.name,
        variant_label: variant.sku, // Will be enriched with option values in production
        sku: variant.sku,
        image_url: variant.product.images?.[0] ?? null,
        unit_price_cents: variant.price_cents,
        quantity: item.quantity,
        option_values: null,
      };
    });

    const { data: order, error: orderError } = await supabase
      .from('shop_orders')
      .insert({
        order_number: orderNumber,
        email,
        shipping_address: shippingAddress,
        shipping_method_id: shippingMethodId,
        subtotal_cents: subtotalCents,
        shipping_cents: shippingCents,
        tax_cents: taxCents,
        total_cents: totalCents,
        stripe_payment_intent_id: paymentIntent.id,
        status: 'pending',
      })
      .select('id')
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Failed to create order.' }, { status: 500 });
    }

    // Insert order items
    await supabase.from('shop_order_items').insert(
      orderItems.map((oi) => ({ ...oi, order_id: order.id }))
    );

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
      taxCents,
      shippingCents,
      totalCents,
    });
  } catch (err) {
    console.error('create-payment-intent error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/shop/create-payment-intent/
git commit -m "feat(shop): add create-payment-intent API route with inventory reservation"
```

---

## Task 16: Build API Route — Confirm Order

**Files:**
- Create: `src/app/api/shop/confirm-order/route.ts`

- [ ] **Step 1: Write the confirm order route**

```ts
// src/app/api/shop/confirm-order/route.ts

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getStripe } from '@/lib/shop/stripe';

export async function POST(request: Request) {
  try {
    const { orderId, paymentIntentId } = (await request.json()) as {
      orderId: string;
      paymentIntentId: string;
    };

    if (!orderId || !paymentIntentId) {
      return NextResponse.json({ error: 'Missing orderId or paymentIntentId.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const stripe = getStripe();

    // 1. Verify payment succeeded
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (pi.status !== 'succeeded') {
      return NextResponse.json({ error: `Payment not successful. Status: ${pi.status}` }, { status: 400 });
    }

    // 2. Fetch order
    const { data: order, error: orderError } = await supabase
      .from('shop_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    // Idempotency: if already paid, return success
    if (order.status === 'paid') {
      return NextResponse.json({ success: true, orderNumber: order.order_number });
    }

    // 3. Update order status
    await supabase
      .from('shop_orders')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', orderId);

    // 4. Deduct actual stock and clear reservations
    const { data: orderItems } = await supabase
      .from('shop_order_items')
      .select('variant_id, quantity')
      .eq('order_id', orderId);

    if (orderItems) {
      for (const item of orderItems) {
        if (!item.variant_id) continue;

        // Fetch current variant stock
        const { data: variant } = await supabase
          .from('shop_variants')
          .select('stock_quantity, reserved_quantity')
          .eq('id', item.variant_id)
          .single();

        if (variant) {
          await supabase
            .from('shop_variants')
            .update({
              stock_quantity: variant.stock_quantity - item.quantity,
              reserved_quantity: Math.max(0, variant.reserved_quantity - item.quantity),
            })
            .eq('id', item.variant_id);
        }
      }
    }

    // 5. Clear reservations for this payment intent
    await supabase
      .from('shop_inventory_reservations')
      .delete()
      .eq('stripe_payment_intent_id', paymentIntentId);

    // 6. Send confirmation email (future: integrate Resend/SendGrid here)
    // For MVP, this is a placeholder — confirmation email will be added
    // when SENDGRID_API_KEY or RESEND_API_KEY is configured for ops-site
    console.log(`[SHOP] Order confirmed: ${order.order_number} — email: ${order.email}`);

    return NextResponse.json({ success: true, orderNumber: order.order_number });
  } catch (err) {
    console.error('confirm-order error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/shop/confirm-order/
git commit -m "feat(shop): add confirm-order API route with stock deduction and reservation cleanup"
```

---

## Task 17: Build API Route — Stripe Webhook

**Files:**
- Create: `src/app/api/shop/webhook/route.ts`

- [ ] **Step 1: Write the Stripe webhook handler**

```ts
// src/app/api/shop/webhook/route.ts

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getStripe } from '@/lib/shop/stripe';
import type Stripe from 'stripe';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured.');
    return NextResponse.json({ error: 'Webhook not configured.' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent;

      // Find the order
      const { data: order } = await supabase
        .from('shop_orders')
        .select('id, status')
        .eq('stripe_payment_intent_id', pi.id)
        .maybeSingle();

      if (order && order.status === 'pending') {
        // Confirm the order (same logic as confirm-order route)
        await supabase
          .from('shop_orders')
          .update({ status: 'paid', paid_at: new Date().toISOString() })
          .eq('id', order.id);

        const { data: orderItems } = await supabase
          .from('shop_order_items')
          .select('variant_id, quantity')
          .eq('order_id', order.id);

        if (orderItems) {
          for (const item of orderItems) {
            if (!item.variant_id) continue;
            const { data: variant } = await supabase
              .from('shop_variants')
              .select('stock_quantity, reserved_quantity')
              .eq('id', item.variant_id)
              .single();

            if (variant) {
              await supabase
                .from('shop_variants')
                .update({
                  stock_quantity: variant.stock_quantity - item.quantity,
                  reserved_quantity: Math.max(0, variant.reserved_quantity - item.quantity),
                })
                .eq('id', item.variant_id);
            }
          }
        }

        await supabase
          .from('shop_inventory_reservations')
          .delete()
          .eq('stripe_payment_intent_id', pi.id);
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent;

      // Release reservations
      const { data: reservations } = await supabase
        .from('shop_inventory_reservations')
        .select('variant_id, quantity')
        .eq('stripe_payment_intent_id', pi.id);

      if (reservations) {
        for (const res of reservations) {
          const { data: variant } = await supabase
            .from('shop_variants')
            .select('reserved_quantity')
            .eq('id', res.variant_id)
            .single();

          if (variant) {
            await supabase
              .from('shop_variants')
              .update({ reserved_quantity: Math.max(0, variant.reserved_quantity - res.quantity) })
              .eq('id', res.variant_id);
          }
        }
      }

      await supabase
        .from('shop_inventory_reservations')
        .delete()
        .eq('stripe_payment_intent_id', pi.id);

      // Update order status
      await supabase
        .from('shop_orders')
        .update({ status: 'cancelled' })
        .eq('stripe_payment_intent_id', pi.id);

      break;
    }
  }

  return NextResponse.json({ received: true });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/shop/webhook/
git commit -m "feat(shop): add Stripe webhook handler for payment success and failure"
```

---

## Task 18: Build Checkout Payment Step and Checkout Page

**Files:**
- Create: `src/components/shop/CheckoutPayment.tsx`
- Create: `src/app/shop/CheckoutClient.tsx`
- Create: `src/app/shop/checkout/page.tsx`

- [ ] **Step 1: Create CheckoutPayment (Stripe Elements)**

```tsx
// src/components/shop/CheckoutPayment.tsx

'use client';

import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface CheckoutPaymentProps {
  orderId: string;
  totalCents: number;
  onSuccess: (orderNumber: string) => void;
  onError: (message: string) => void;
}

export default function CheckoutPayment({ orderId, totalCents, onSuccess, onError }: CheckoutPaymentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      onError(error.message ?? 'Payment failed. Please try again.');
      setIsProcessing(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      // Confirm the order on our backend
      try {
        const res = await fetch('/api/shop/confirm-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, paymentIntentId: paymentIntent.id }),
        });
        const data = await res.json();
        if (data.success) {
          onSuccess(data.orderNumber);
        } else {
          onError(data.error ?? 'Failed to confirm order.');
        }
      } catch {
        onError('Failed to confirm order. Your payment was received — please contact support.');
      }
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: 'tabs',
        }}
      />
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-ops-text-primary text-ops-background py-3 rounded-[3px] font-caption uppercase tracking-[0.15em] text-xs hover:bg-white/90 active:bg-white/80 transition-all cursor-pointer disabled:opacity-50"
      >
        {isProcessing ? 'Processing...' : `Pay $${(totalCents / 100).toFixed(2)}`}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Create CheckoutClient (stepped form orchestrator)**

```tsx
// src/app/shop/CheckoutClient.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/lib/stores/cart';
import { theme } from '@/lib/theme';
import CheckoutShipping from '@/components/shop/CheckoutShipping';
import CheckoutPayment from '@/components/shop/CheckoutPayment';
import OrderSummary from '@/components/shop/OrderSummary';
import type { ShippingAddress, ShopShippingMethod } from '@/lib/shop/types';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutClientProps {
  shippingMethods: ShopShippingMethod[];
}

type CheckoutStep = 'shipping' | 'payment';

export default function CheckoutClient({ shippingMethods }: CheckoutClientProps) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Payment state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [shippingCents, setShippingCents] = useState<number>(0);
  const [taxCents, setTaxCents] = useState<number>(0);
  const [totalCents, setTotalCents] = useState<number>(0);

  // Redirect to shop if cart is empty
  if (items.length === 0 && step === 'shipping') {
    router.push('/shop');
    return null;
  }

  const handleShippingContinue = async (address: ShippingAddress, email: string, shippingMethodId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/shop/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
          shippingAddress: address,
          shippingMethodId,
          email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Failed to create payment. Please try again.');
        setIsLoading(false);
        return;
      }

      setClientSecret(data.clientSecret);
      setOrderId(data.orderId);
      setShippingCents(data.shippingCents);
      setTaxCents(data.taxCents);
      setTotalCents(data.totalCents);
      setStep('payment');
    } catch {
      setError('Network error. Please try again.');
    }

    setIsLoading(false);
  };

  const handlePaymentSuccess = (orderNumber: string) => {
    clearCart();
    router.push(`/shop/confirmation?order=${orderId}`);
  };

  const handlePaymentError = (message: string) => {
    setError(message);
  };

  const stepIndicators = [
    { key: 'shipping', label: 'Shipping', number: 1 },
    { key: 'payment', label: 'Payment', number: 2 },
    { key: 'confirm', label: 'Confirm', number: 3 },
  ];

  return (
    <div className="pt-24 pb-20 px-6 md:px-10 max-w-[1400px] mx-auto">
      {/* Breadcrumb */}
      <div className="mb-8">
        <span className="font-caption uppercase tracking-[0.15em] text-[9px] text-ops-text-secondary">Shop</span>
        <span className="text-white/30 text-[9px] mx-2">/</span>
        <span className="font-caption uppercase tracking-[0.15em] text-[9px] text-ops-text-primary">Checkout</span>
      </div>

      {/* Step indicators */}
      <div className="flex gap-6 mb-8">
        {stepIndicators.map((s) => {
          const isActive = s.key === step;
          const isCompleted = step === 'payment' && s.key === 'shipping';
          return (
            <div key={s.key} className="flex items-center gap-2">
              <span
                className={`
                  w-5 h-5 rounded-full text-[9px] flex items-center justify-center
                  ${isActive || isCompleted
                    ? 'bg-white text-ops-background'
                    : 'border border-white/20 text-ops-text-secondary'
                  }
                `}
              >
                {s.number}
              </span>
              <span
                className={`font-caption uppercase tracking-[0.1em] text-[9px] ${
                  isActive ? 'text-ops-text-primary' : 'text-ops-text-secondary'
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-[2px] px-4 py-3 mb-6">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Form */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {step === 'shipping' && (
              <motion.div
                key="shipping"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: theme.animation.easing }}
              >
                <CheckoutShipping
                  shippingMethods={shippingMethods}
                  onContinue={handleShippingContinue}
                  isLoading={isLoading}
                />
              </motion.div>
            )}
            {step === 'payment' && clientSecret && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, ease: theme.animation.easing }}
              >
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: 'night',
                      variables: {
                        colorPrimary: '#597794',
                        colorBackground: '#141414',
                        colorText: '#FFFFFF',
                        borderRadius: '2px',
                        fontFamily: 'Mohave, sans-serif',
                      },
                    },
                  }}
                >
                  <CheckoutPayment
                    orderId={orderId!}
                    totalCents={totalCents}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </Elements>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Order summary */}
        <div className="lg:col-span-2">
          <OrderSummary
            shippingCents={step === 'payment' ? shippingCents : undefined}
            taxCents={step === 'payment' ? taxCents : undefined}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create checkout page (server component)**

```tsx
// src/app/shop/checkout/page.tsx

import { Metadata } from 'next';
import CheckoutClient from '../CheckoutClient';
import { getShippingMethods } from '@/lib/shop/queries';

export const metadata: Metadata = {
  title: 'Checkout — OPS Gear',
};

export default async function CheckoutPage() {
  const shippingMethods = await getShippingMethods();

  return <CheckoutClient shippingMethods={shippingMethods} />;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/shop/CheckoutPayment.tsx src/app/shop/CheckoutClient.tsx src/app/shop/checkout/
git commit -m "feat(shop): build checkout page with stepped form, Stripe Elements, and order summary"
```

---

## Task 19: Build Confirmation Page

**Files:**
- Create: `src/app/shop/confirmation/page.tsx`

- [ ] **Step 1: Create the confirmation page**

```tsx
// src/app/shop/confirmation/page.tsx

import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getOrderWithItems } from '@/lib/shop/queries';
import FadeInUp from '@/components/ui/FadeInUp';

export const metadata: Metadata = {
  title: 'Order Confirmed — OPS Gear',
};

interface ConfirmationPageProps {
  searchParams: Promise<{ order?: string }>;
}

export default async function ConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const { order: orderId } = await searchParams;

  if (!orderId) redirect('/shop');

  const order = await getOrderWithItems(orderId);
  if (!order) notFound();

  const address = order.shipping_address;

  return (
    <div className="pt-24 pb-20 px-6 md:px-10 max-w-[600px] mx-auto text-center">
      <FadeInUp>
        {/* Checkmark */}
        <div className="w-12 h-12 border-2 border-ops-accent rounded-full mx-auto mb-5 flex items-center justify-center">
          <span className="text-ops-accent text-xl">✓</span>
        </div>

        <h1 className="font-heading text-ops-text-primary text-xl font-light uppercase tracking-[0.05em] mb-2">
          Order Confirmed
        </h1>
        <p className="text-ops-text-secondary text-xs mb-1">
          {order.order_number}
        </p>
        <p className="text-ops-text-secondary text-xs mb-8">
          Confirmation sent to {order.email}
        </p>
      </FadeInUp>

      {/* Order summary card */}
      <FadeInUp delay={0.1}>
        <div className="bg-ops-surface border border-white/[0.06] rounded-[3px] p-5 text-left mb-6">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-2.5 py-2 border-b border-white/[0.06] last:border-b-0">
              <div className="w-9 h-9 bg-ops-surface-elevated rounded-[2px] flex-shrink-0 overflow-hidden relative">
                {item.image_url ? (
                  <Image src={item.image_url} alt="" fill className="object-cover" sizes="36px" />
                ) : (
                  <div className="w-full h-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-ops-text-primary text-[9px] font-body uppercase truncate">
                  {item.product_name}
                </p>
                <p className="text-ops-text-secondary text-[8px] mt-0.5">
                  {item.variant_label} × {item.quantity}
                </p>
              </div>
              <span className="text-ops-accent text-[10px] flex-shrink-0">
                ${((item.unit_price_cents * item.quantity) / 100).toFixed(2)}
              </span>
            </div>
          ))}

          <div className="pt-3 space-y-1.5">
            <div className="flex justify-between">
              <span className="font-caption uppercase tracking-[0.1em] text-ops-text-secondary text-[9px]">Subtotal</span>
              <span className="text-ops-text-primary text-[10px]">${(order.subtotal_cents / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-caption uppercase tracking-[0.1em] text-ops-text-secondary text-[9px]">Shipping</span>
              <span className="text-ops-text-primary text-[10px]">${(order.shipping_cents / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-caption uppercase tracking-[0.1em] text-ops-text-secondary text-[9px]">Tax</span>
              <span className="text-ops-text-primary text-[10px]">${(order.tax_cents / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-ops-border">
              <span className="font-caption uppercase tracking-[0.1em] text-ops-text-primary text-[10px]">Total</span>
              <span className="text-ops-text-primary text-[13px]">${(order.total_cents / 100).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </FadeInUp>

      {/* Shipping address */}
      <FadeInUp delay={0.2}>
        <div className="bg-ops-surface border border-white/[0.06] rounded-[3px] px-5 py-4 text-left mb-8">
          <span className="font-caption uppercase tracking-[0.15em] text-[8px] text-ops-text-secondary block mb-2">
            Shipping To
          </span>
          <p className="text-ops-text-primary text-[11px] leading-relaxed">
            {address.firstName} {address.lastName}<br />
            {address.line1}<br />
            {address.line2 && <>{address.line2}<br /></>}
            {address.city}, {address.state} {address.zip}
          </p>
        </div>
      </FadeInUp>

      <FadeInUp delay={0.3}>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center font-caption uppercase tracking-[0.15em] text-xs px-6 py-3 rounded-[3px] bg-transparent text-ops-text-primary border border-ops-border hover:border-ops-border-hover transition-all"
        >
          Back to Shop
        </Link>
      </FadeInUp>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/shop/confirmation/
git commit -m "feat(shop): build order confirmation page with receipt and shipping details"
```

---

## Task 20: Verify Build and Final Integration

- [ ] **Step 1: Verify the project builds**

```bash
cd /Users/jacksonsweet/Projects/OPS/ops-site
npm run build
```

Fix any TypeScript errors or build failures.

- [ ] **Step 2: Verify all pages render at dev server**

```bash
npm run dev
```

Open:
- `http://localhost:3000/shop` — should render (empty catalog, but no errors)
- `http://localhost:3000/shop/checkout` — should redirect to `/shop` (empty cart)

- [ ] **Step 3: Verify navigation includes SHOP link and cart icon**

Check desktop and mobile nav both show SHOP link. Cart icon visible in desktop nav. Footer shows Shop link in PRODUCT column.

- [ ] **Step 4: Commit any build fixes**

```bash
git add -A
git commit -m "fix(shop): resolve build errors from merch store integration"
```

---

## Task 21: Configure Vercel Environment Variables

This task requires manual action by the user.

- [ ] **Step 1: Add Stripe env vars to ops-site Vercel project**

Go to Vercel Dashboard → ops-site project → Settings → Environment Variables. Add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | (from Stripe Dashboard) | All |
| `STRIPE_SECRET_KEY` | (from Stripe Dashboard) | Production, Preview |
| `STRIPE_WEBHOOK_SECRET` | (from Stripe Webhook config) | Production, Preview |

- [ ] **Step 2: Register Stripe webhook endpoint**

In Stripe Dashboard → Webhooks → Add endpoint:
- URL: `https://opsapp.co/api/shop/webhook` (or your ops-site domain)
- Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
- Copy the signing secret → set as `STRIPE_WEBHOOK_SECRET` in Vercel

- [ ] **Step 3: Create a Supabase Storage bucket for product images**

In Supabase Dashboard → Storage → Create bucket:
- Name: `shop-images`
- Public: Yes
- File size limit: 5MB
- Allowed MIME types: `image/jpeg, image/png, image/webp`

---

## Summary

| Task | What it builds | Est. time |
|------|---------------|-----------|
| 1 | Install Stripe packages | 1 min |
| 2 | Update next.config for images | 1 min |
| 3 | i18n shop namespace + dictionaries | 3 min |
| 4 | Database schema (10 tables) | 5 min |
| 5 | TypeScript types | 3 min |
| 6 | Supabase query helpers | 5 min |
| 7 | Stripe server helpers | 2 min |
| 8 | Zustand cart store | 3 min |
| 9 | Nav + cart icon + footer updates | 5 min |
| 10 | Cart drawer + cart item | 5 min |
| 11 | Hero, category filter, product card | 5 min |
| 12 | Product expanded (inline expansion) | 5 min |
| 13 | Shop page (server + client) | 5 min |
| 14 | Checkout shipping + order summary | 5 min |
| 15 | API: create-payment-intent | 5 min |
| 16 | API: confirm-order | 3 min |
| 17 | API: Stripe webhook | 3 min |
| 18 | Checkout payment + page | 5 min |
| 19 | Confirmation page | 3 min |
| 20 | Build verification | 3 min |
| 21 | Vercel env vars (manual) | 5 min |
