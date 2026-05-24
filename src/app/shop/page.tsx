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

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'OPS Gear — Shop',
  description: 'Rep the brand that runs your business. Hats, tees, hoodies, and drinkware built for the job site. Free shipping on orders over $75.',
  openGraph: {
    url: 'https://opsapp.co/shop',
    title: 'OPS Gear — Shop',
    description: 'Rep the brand that runs your business.',
  },
  alternates: {
    canonical: 'https://opsapp.co/shop',
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
