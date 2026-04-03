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

/** Check if the store is live (controlled by admin panel toggle) */
export async function isStoreLive(): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('shop_settings')
    .select('store_live')
    .limit(1)
    .maybeSingle();

  if (error || !data) return false;
  return data.store_live;
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
