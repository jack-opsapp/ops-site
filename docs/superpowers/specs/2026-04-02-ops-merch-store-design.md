# OPS Merch Store — System Design Spec

**Date:** 2026-04-02
**Status:** Approved
**Platform:** ops-site (Next.js 16, Tailwind v4, Supabase, Stripe)

---

## Overview

A merch store at `/shop` on the OPS marketing site selling physical goods (apparel, accessories, drinkware). Supabase-native product catalog, Zustand cart, embedded Stripe Elements checkout, guest-only (no accounts). Self-managed inventory with flat-rate shipping and Stripe Tax for sales tax calculation.

Admin panel requirements are captured in Appendix A for a future OPS-Web build.

---

## 1. Pages & Routes

| Route | Purpose |
|-------|---------|
| `/shop` | Store page — featured hero, category filters, product grid |
| `/shop/checkout` | Stepped checkout — Shipping → Payment → Confirm |
| `/shop/confirmation` | Post-purchase confirmation with order receipt |

No individual product pages. Product detail is handled via inline card expansion on `/shop`.

---

## 2. Navigation

Add "SHOP" to the `navLinkKeys` array in `Navigation.tsx`:
```ts
{ key: 'nav.shop', href: '/shop' }
```

Add a cart icon to the right side of the nav bar (next to auth/GET OPS button):
- **Empty:** Muted shopping bag icon, no badge
- **Has items:** White icon, white circle badge with item count
- **Item added:** Badge pops with scale spring animation + subtle glow, settles after 300ms
- Clicking the cart icon opens the cart drawer

Add translation keys to `en/common.json` and `es/common.json`.

---

## 3. Store Page Layout (`/shop`)

### 3.1 Featured Hero Banner

Full-width card at the top of the page. Two-column layout:
- **Left:** Large product image
- **Right:** "NEW DROP" label (Kosugi, accent color), product name (Mohave, light weight, uppercase), short description, "SHOP NOW — $XX" solid button

The hero pulls the product where `is_featured = true` from the catalog. If multiple are featured, show the most recently updated. If none are featured, the hero section is hidden and the page starts with category filters.

### 3.2 Category Filter Bar

Horizontal row of pill-style toggle buttons below the hero:
- "ALL" (default, solid white bg / dark text)
- One pill per active category from `shop_categories` (ghost style: border, muted text)
- Active pill: solid white bg / dark text. Inactive: ghost.
- Clicking a category filters the grid with a layout animation (Framer Motion `AnimatePresence` + `layoutId`)
- Kosugi font, uppercase, tracking-[0.15em], text-[10px]

### 3.3 Product Grid

3-column grid (`grid-cols-3`, gap-16px). Each card:
- **Image area:** `bg-surface-elevated` (#141414), product image centered
- **Info area:** Product name (Mohave, uppercase, 11px), price in accent color (#597794)
- **Card styling:** `bg-surface` (#0D0D0D), 1px border (white 10% opacity), border-radius 3px
- **Hover:** translate-y-1 lift, border brightens to 25% opacity
- **Entrance:** FadeInUp staggered animation on scroll/filter change

Responsive: 3 cols on desktop, 2 on tablet, 1 on mobile.

Products sorted by `sort_order` within their category. Only `is_active = true` and `archived_at IS NULL` products are shown.

### 3.4 Inline Card Expansion (Product Detail)

When a product card is clicked:

1. Card animates to full grid width using Framer Motion `layout` prop and `layoutId`
2. Internal layout becomes two-column: image gallery (left) + product details (right)
3. Sibling cards push down with spring physics (staggered, subtle)
4. Total expansion duration: ~400ms, ease-out

**Expanded card — left column:**
- Large primary image
- Thumbnail row below (clickable to swap main image)
- Images sourced from the product's `images` JSONB array

**Expanded card — right column:**
- Category label (Kosugi, accent color)
- Close button (×) top-right
- Product name (Mohave, 18px, light weight, uppercase)
- Color/variant name if applicable
- Price (accent color, 14px)
- Description (text-secondary, 10px, line-height 1.7)
- **Option selectors:** One row per option type (e.g., "Size" row with S/M/L/XL/2XL pills). Selected pill: white border + white text. Unselected: muted border + muted text. Out-of-stock variant: muted with strikethrough, not clickable.
- **Quantity selector:** −/+/number, min 1, max = available stock
- **Add to Cart button:** Solid white, full width. Shows "ADD TO CART — $XX". On click: item added to Zustand cart, button briefly shows checkmark, cart icon badge pops.
- If variant has `stock_quantity - reserved_quantity <= 0`: button disabled, shows "SOLD OUT"
- If stock is low (≤ 3): show "Only X left" in muted text above the button

**Closing:** × button or clicking outside the expanded card. Details fade out, card morphs back to grid size, siblings slide up. Reverse of open animation.

**URL behavior:** No route change. URL stays `/shop`. Expanded product ID stored in Zustand for state management (not URL hash — keeps things clean).

---

## 4. Cart

### 4.1 State Management

Zustand store with `persist` middleware (localStorage). Cart shape:

```ts
interface CartItem {
  productId: string
  variantId: string
  productName: string
  variantLabel: string       // e.g., "M" or "Matte Black"
  imageSrc: string           // primary image URL
  priceCents: number
  quantity: number
  maxQuantity: number        // available stock at time of add
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  subtotalCents: () => number
}
```

Adding the same variantId increments quantity (capped at maxQuantity). Cart persists across sessions via localStorage.

### 4.2 Cart Drawer

Slide-over drawer from the right side of the viewport. Triggered by clicking the cart icon in nav.

- **Header:** "YOUR CART" (Mohave, uppercase) + close button (×)
- **Item list:** Each item shows thumbnail, name, variant label, quantity adjuster (−/+), line price in accent color. Swipe left to remove (mobile) or × icon (desktop).
- **Footer (sticky):** Subtotal, "Shipping calculated at checkout" note, "CHECKOUT" solid button
- **Empty state:** Centered message "Your cart is empty" + "BROWSE SHOP" ghost button
- **Backdrop:** Semi-transparent dark overlay on the rest of the page

Drawer animates in from the right (Framer Motion, 300ms, ease-out). Backdrop fades in simultaneously.

---

## 5. Checkout (`/shop/checkout`)

### 5.1 Layout

Two-column layout:
- **Left (60%):** Stepped form
- **Right (40%):** Order summary sidebar (sticky)

Breadcrumb at top: Shop / Checkout

### 5.2 Steps

**Step 1 — Shipping:**
- Fields: First Name, Last Name, Email, Address Line 1, Address Line 2 (optional), City, State (dropdown), ZIP, Country (US only for launch)
- All fields use the OPS input style: `bg-surface-elevated`, 1px border, border-radius 2px, Kosugi uppercase labels
- After address fields are filled, shipping method selector appears (see 5.4)
- "CONTINUE TO PAYMENT" solid button (disabled until shipping method selected)
- On submit: validate fields client-side, create Stripe PaymentIntent via API route (includes tax calculation), reserve inventory in Supabase

**Step 2 — Payment:**
- Stripe Elements `PaymentElement` embedded inline, styled to match OPS dark theme using Stripe's `appearance` API:
  - `theme: 'night'`
  - `variables: { colorPrimary: '#597794', colorBackground: '#141414', colorText: '#FFFFFF', borderRadius: '2px', fontFamily: 'Mohave' }`
- Order summary visible on right
- "PAY $XXX.XX" solid button
- On submit: confirm PaymentIntent via Stripe.js, handle success/failure

**Step 3 — Confirmation:**
Redirect to `/shop/confirmation?order={orderId}` on successful payment.

### 5.3 Order Summary Sidebar (Sticky)

- Item list: thumbnail, name, variant, quantity, line price
- Subtotal
- Shipping (calculated after Step 1 — based on selected shipping method)
- Tax (calculated via Stripe Tax after address is entered)
- **Total** (bold, larger)

### 5.4 Shipping Method Selection

After entering shipping address in Step 1, display available shipping methods from `shop_shipping_methods` table:
- Radio buttons, each showing method name, description, and price
- e.g., "Standard Shipping — 5-7 business days — $7.99"
- e.g., "Free Shipping" (shown if subtotal meets `min_order_cents` threshold)
- Selected method stored on the order

### 5.5 Inventory Reservation

When the user clicks "Continue to Payment" (Step 1 → Step 2):
1. API route calls Supabase to increment `reserved_quantity` on each variant in the cart
2. Reservation has a 15-minute TTL
3. A Supabase cron job (or pg_cron) clears expired reservations every 5 minutes
4. If reservation fails (stock unavailable), return user to cart with a message indicating which items are no longer available

---

## 6. Confirmation Page (`/shop/confirmation`)

- Animated checkmark (Framer Motion scale + opacity, accent border)
- Order number (format: OPS-XXXX, sequential or nanoid)
- "Confirmation sent to {email}" subtitle
- Itemized receipt card: each item with thumbnail, name, variant, qty, line price
- Totals: subtotal, shipping, tax, total
- Shipping address card
- "BACK TO SHOP" ghost button

### 6.1 Confirmation Email

Triggered directly from the `confirm-order` API route (no Edge Functions — none exist in the OPS ecosystem):
- Send via Resend (or SendGrid — OPS-Web already uses SendGrid with `SENDGRID_API_KEY`)
- Content mirrors the confirmation page: order number, items, totals, shipping address
- Plain, text-heavy email styled with OPS brand colors (dark bg, white text, accent highlights)
- Include a "Questions? Reply to this email" footer

---

## 7. Data Model (Supabase)

### 7.1 `shop_categories`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, default gen_random_uuid() |
| name | text | NOT NULL, e.g., "Apparel" |
| slug | text | NOT NULL, UNIQUE, URL-safe |
| sort_order | int | Default 0 |
| created_at | timestamptz | Default now() |

### 7.2 `shop_products`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| category_id | uuid | FK → shop_categories, NOT NULL |
| name | text | NOT NULL |
| slug | text | UNIQUE, NOT NULL |
| description | text | Short product description |
| price_cents | int | Base display price in cents |
| images | jsonb | Array of image URLs, first = primary |
| is_featured | bool | Default false. Shown in hero banner. |
| is_active | bool | Default true. Visible in store. |
| archived_at | timestamptz | NULL = active. Set to soft-delete. |
| tax_code | text | Stripe Tax product code, e.g., 'txcd_99999999' |
| sort_order | int | Default 0 |
| created_at | timestamptz | Default now() |
| updated_at | timestamptz | Default now(), updated via trigger |

### 7.3 `shop_product_options`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| product_id | uuid | FK → shop_products, NOT NULL |
| name | text | NOT NULL, e.g., "Size", "Color" |
| sort_order | int | Default 0 |

### 7.4 `shop_product_option_values`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| option_id | uuid | FK → shop_product_options, NOT NULL |
| value | text | NOT NULL, e.g., "M", "L", "Matte Black" |
| sort_order | int | Default 0 |

### 7.5 `shop_variants`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| product_id | uuid | FK → shop_products, NOT NULL |
| sku | text | UNIQUE, NOT NULL |
| price_cents | int | Variant-specific price (overrides product base price) |
| stock_quantity | int | Current physical inventory count |
| reserved_quantity | int | Default 0. Held during active checkouts. |
| is_active | bool | Default true |
| sort_order | int | Default 0 |

### 7.6 `shop_variant_option_values` (pivot)
| Column | Type | Notes |
|--------|------|-------|
| variant_id | uuid | FK → shop_variants, NOT NULL |
| option_value_id | uuid | FK → shop_product_option_values, NOT NULL |
| PRIMARY KEY | (variant_id, option_value_id) | Composite |

### 7.7 `shop_shipping_methods`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| name | text | NOT NULL, e.g., "Standard Shipping" |
| description | text | e.g., "5-7 business days" |
| price_cents | int | NOT NULL |
| min_order_cents | int | NULL. If set, method is free when subtotal >= this value. |
| is_active | bool | Default true |
| sort_order | int | Default 0 |

### 7.8 `shop_orders`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| order_number | text | UNIQUE, human-readable, e.g., "OPS-2847" |
| email | text | NOT NULL |
| shipping_address | jsonb | {firstName, lastName, line1, line2, city, state, zip, country} |
| shipping_method_id | uuid | FK → shop_shipping_methods |
| subtotal_cents | int | NOT NULL |
| shipping_cents | int | NOT NULL |
| tax_cents | int | NOT NULL |
| total_cents | int | NOT NULL |
| stripe_payment_intent_id | text | NOT NULL |
| stripe_tax_calculation_id | text | For Stripe Tax reconciliation |
| status | text | NOT NULL, default 'pending'. Values: pending, paid, shipped, delivered, cancelled, refunded |
| paid_at | timestamptz | Set when payment confirmed |
| shipped_at | timestamptz | Set when marked as shipped |
| tracking_number | text | Carrier tracking number |
| tracking_url | text | Carrier tracking URL |
| notes | text | Internal notes (admin use) |
| created_at | timestamptz | Default now() |
| updated_at | timestamptz | Default now() |

### 7.9 `shop_order_items`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| order_id | uuid | FK → shop_orders, NOT NULL |
| product_id | uuid | FK → shop_products, NULL (nullable for soft-deleted products) |
| variant_id | uuid | FK → shop_variants, NULL (nullable for soft-deleted variants) |
| product_name | text | NOT NULL — snapshot |
| variant_label | text | NOT NULL — snapshot, e.g., "M / Black" |
| sku | text | NOT NULL — snapshot |
| image_url | text | Snapshot of primary image |
| unit_price_cents | int | NOT NULL — price at time of purchase |
| quantity | int | NOT NULL |
| option_values | jsonb | Snapshot, e.g., {"Size": "M", "Color": "Black"} |

### 7.10 `shop_inventory_reservations`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| variant_id | uuid | FK → shop_variants, NOT NULL |
| quantity | int | NOT NULL |
| stripe_payment_intent_id | text | Links reservation to checkout session |
| expires_at | timestamptz | NOT NULL, default now() + interval '15 minutes' |
| created_at | timestamptz | Default now() |

Cron job every 5 minutes: delete expired reservations and decrement `reserved_quantity` on the corresponding variants.

---

## 8. API Routes

### 8.1 `POST /api/shop/create-payment-intent`

Called when user proceeds from Shipping to Payment step.

**Request:** `{ items: CartItem[], shippingAddress: Address, shippingMethodId: string }`

**Flow:**
1. Validate cart items against current inventory
2. Reserve inventory (insert into `shop_inventory_reservations`, increment `reserved_quantity` on variants)
3. Calculate tax via Stripe Tax API (passing items with `tax_code`, shipping address, and shipping amount)
4. Create Stripe PaymentIntent with calculated total
5. Create `shop_orders` row with status `pending`
6. Return `{ clientSecret, orderId, tax, shipping, total }`

### 8.2 `POST /api/shop/confirm-order`

Called after Stripe.js `confirmPayment` succeeds (or via Stripe webhook for reliability).

**Flow:**
1. Verify PaymentIntent status is `succeeded`
2. Update order status to `paid`, set `paid_at`
3. Decrement `stock_quantity` on variants (actual deduction, not just reserved)
4. Clear inventory reservations for this order
5. Trigger confirmation email (Supabase Edge Function or direct Resend call)

### 8.3 Stripe Webhook (`POST /api/shop/webhook`)

Handles `payment_intent.succeeded` and `payment_intent.payment_failed` events as a safety net:
- On success: same flow as confirm-order (idempotent)
- On failure: release inventory reservations, update order status to `cancelled`

---

## 9. Stripe Integration

- **Stripe Elements** with `PaymentElement` (supports cards, Apple Pay, Google Pay automatically)
- **Stripe Tax** for US sales tax calculation (0.5% per transaction cost)
- **Appearance API** to match OPS dark theme
- **Payment Intent flow:** create on server → confirm on client → verify via webhook
- Store `stripe_payment_intent_id` on every order for refunds, disputes, and reconciliation

---

## 10. Animations Summary

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Product cards entrance | FadeInUp, staggered | 600ms | `[0.22, 1, 0.36, 1]` (theme.animation.easing) |
| Category filter transition | Framer Motion `AnimatePresence` + `layout` | 400ms | `[0.22, 1, 0.36, 1]` |
| Card expansion | Framer Motion `layoutId` morph | 400ms | `[0.22, 1, 0.36, 1]` |
| Sibling cards push down | Spring physics, staggered 50ms | 400ms | spring (stiffness: 300, damping: 30) |
| Expanded detail fade-in | Opacity 0→1 (size, qty, add-to-cart) | 200ms | `[0.22, 1, 0.36, 1]`, 200ms delay |
| Card collapse | Reverse of expansion | 350ms | `[0.22, 1, 0.36, 1]` |
| Cart drawer slide-in | translateX(100%) → 0 | 300ms | `[0.22, 1, 0.36, 1]` |
| Cart backdrop fade | Opacity 0→0.6 | 300ms | `[0.22, 1, 0.36, 1]` |
| Cart badge pop | Scale 0.5→1.15→1 | 300ms | spring |
| Cart badge glow | Box-shadow pulse | 300ms | `[0.22, 1, 0.36, 1]` |
| Add to cart button | Checkmark morph (text → ✓ → text) | 500ms | `[0.22, 1, 0.36, 1]` |
| Checkout step transition | Fade + slide left | 300ms | `[0.22, 1, 0.36, 1]` |
| Confirmation checkmark | Scale 0→1 + opacity | 500ms | spring (bounce) |
| Hero banner content | FadeInUp | 800ms | `[0.22, 1, 0.36, 1]` |

All easing uses the project standard from `theme.animation.easing: [0.22, 1, 0.36, 1]`. Spring physics used only where explicitly noted. Reduced motion: respect `useReducedMotion()` hook — collapse animations to identity transforms (following `BlogPostRow.tsx` pattern).

---

## 11. Responsive Behavior

| Breakpoint | Grid | Product Detail | Checkout |
|------------|------|---------------|----------|
| Desktop (≥1024px) | 3 columns | Inline expansion, 2-col internal | 2-col (form + summary) |
| Tablet (640-1023px) | 2 columns | Inline expansion, stacked internal (image above details) | Stacked (summary above form) |
| Mobile (<640px) | 1 column | Full-width expansion, stacked | Single column, summary collapsible |

Cart drawer: full-width on mobile, 400px max-width on desktop.

---

## 12. SEO

- Meta title: "OPS Gear — Shop" / product-specific meta for future product pages
- OpenGraph image: featured product or branded store image
- Structured data: `Product` schema on each product (embedded in page via JSON-LD)
- Canonical URL: `/shop`

---

## 13. i18n

Add translation keys for:
- `common.json`: nav.shop, cart labels, empty state text
- New `shop.json` dictionary: all store copy (hero, category names, checkout labels, confirmation text, error messages)

All user-facing strings go through the translation system. No hardcoded English.

---

## 14. Infrastructure Prerequisites

### 14.1 New Dependencies
```bash
# Server-side Stripe SDK
npm install stripe
# Client-side Stripe.js
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 14.2 Environment Variables (Vercel)
Add to the ops-site Vercel project:
| Variable | Scope | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client | Same Stripe account as OPS-Web |
| `STRIPE_SECRET_KEY` | Server | Same Stripe account as OPS-Web |
| `STRIPE_WEBHOOK_SECRET` | Server | **New** — separate endpoint needs its own signing secret |
| `SENDGRID_API_KEY` | Server | Same as OPS-Web (if using SendGrid for confirmation emails) |

### 14.3 Image Hosting
Product images need a CDN domain added to `next.config.ts` `remotePatterns`. Options:
- Supabase Storage (`ijeekuhbatykdomumfjx.supabase.co/storage/v1/...`)
- External CDN (e.g., Cloudflare R2, S3 + CloudFront)
Decision: use Supabase Storage (already provisioned, no extra cost for the project's scale).

### 14.4 Supabase Migrations
All apps share the same Supabase project (`ijeekuhbatykdomumfjx.supabase.co`). Migrations for the 10 `shop_*` tables should be applied via the Supabase MCP tool (`execute_sql`) since ops-site has no local `supabase/` directory. All tables are prefixed with `shop_` to avoid namespace collisions.

### 14.5 RLS Policies
API routes use `getSupabaseAdmin()` (service role, bypasses RLS). However, add `SELECT` policies for the `anon` role on read-only tables (`shop_categories`, `shop_products`, `shop_product_options`, `shop_product_option_values`, `shop_variants`, `shop_variant_option_values`, `shop_shipping_methods`) for defense-in-depth and potential future client-side reads.

Write operations (`shop_orders`, `shop_order_items`, `shop_inventory_reservations`) should only allow `INSERT` via authenticated service role (no anon writes).

### 14.6 Existing Patterns to Follow
| Pattern | Source | Usage |
|---------|--------|-------|
| API routes | `src/app/api/contact/route.ts` | `getSupabaseAdmin()`, `NextResponse.json()` |
| Server data fetching | `src/lib/blog.ts` | Async helpers called from server components |
| Animation easing | `src/lib/theme.ts` → `theme.animation.easing` | `[0.22, 1, 0.36, 1]` for all transitions |
| Scroll reveals | `src/components/ui/FadeInUp.tsx` | Wrap section-level elements |
| Card pattern | `src/components/ui/Card.tsx` | Dark surface, thin border, hover lift |
| Button variants | `src/components/ui/Button.tsx` | `solid` / `ghost`, Kosugi caps |
| i18n | `src/i18n/server.ts` → `getTDict('shop')` | Add `shop` to `Namespace` type, create dictionaries |
| Reduced motion | `useReducedMotion()` hook | Collapse animations to identity transforms |
| ISR | `export const revalidate = 300` | 5-minute cache for product data |

---

## Appendix A: Admin Panel Requirements (Future OPS-Web Build)

These requirements should be captured for a future store management panel in the OPS web admin dashboard:

### Product Management
- CRUD for products (name, description, price, images, category, tax code, featured flag, active/archive)
- Image upload with drag-and-drop reordering
- Option and variant management (add/edit sizes, colors, SKUs)
- Bulk price editing
- Product preview (see how it looks on the store)

### Inventory Management
- Stock levels per variant with low-stock alerts (configurable threshold)
- Stock adjustment log (who changed what, when, why)
- Reserved quantity visibility (how many are held in active checkouts)
- Bulk stock update (CSV import or inline editing)

### Order Management
- Order list with filtering by status, date range, search by order number/email
- Order detail view: items, customer info, shipping address, payment status, Stripe link
- Status transitions: pending → paid → shipped → delivered (with timestamp tracking)
- Add tracking number and URL (triggers email to customer)
- Internal notes per order
- Refund initiation (calls Stripe Refund API)
- Cancel order (releases inventory, refunds if paid)

### Shipping Management
- CRUD for shipping methods (name, description, price, free-shipping threshold)
- Enable/disable shipping methods

### Category Management
- CRUD for categories (name, slug, sort order)
- Drag-and-drop reordering

### Analytics (future)
- Revenue over time
- Top-selling products
- Inventory turnover
- Conversion rate (views → add to cart → purchase)
- Average order value

---

## Appendix B: Out of Scope (For Now)

- User accounts / order history for logged-in users
- Wishlist / save for later
- Product reviews / ratings
- Discount codes / promo codes
- Multi-currency / international shipping
- Product recommendations ("You might also like")
- Inventory sync with external systems
- Print-on-demand integration
