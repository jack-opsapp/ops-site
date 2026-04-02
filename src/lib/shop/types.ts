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
