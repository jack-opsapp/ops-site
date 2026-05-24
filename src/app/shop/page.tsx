/**
 * /shop — OPS Merch Store
 *
 * Server component. Fetches categories, products, and featured product
 * from Supabase at build time (ISR: 5-minute revalidation).
 * Passes data to ShopClient for client-side interactivity.
 */

import { Metadata } from 'next';
import ShopClient from './ShopClient';
import { getCategories, getAllProductsWithDetails, getFeaturedProduct } from '@/lib/shop/queries';
import { getLocale, buildLocaleAlternates, buildLocaleUrl } from '@/i18n/server';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: locale === 'es' ? 'OPS Gear — Tienda' : 'OPS Gear — Shop',
    description: locale === 'es'
      ? 'Representa la marca que maneja tu negocio. Gorras, camisetas, sudaderas y termos hechos para el sitio de trabajo. Envío gratis en pedidos sobre $75.'
      : 'Rep the brand that runs your business. Hats, tees, hoodies, and drinkware built for the job site. Free shipping on orders over $75.',
    openGraph: {
      url: buildLocaleUrl('/shop', locale),
      title: locale === 'es' ? 'OPS Gear — Tienda' : 'OPS Gear — Shop',
      description: locale === 'es'
        ? 'Representa la marca que maneja tu negocio.'
        : 'Rep the brand that runs your business.',
    },
    alternates: buildLocaleAlternates('/shop', locale),
  };
}

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
