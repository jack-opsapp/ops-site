import type { MetadataRoute } from 'next';
import { getAllLiveSlugs } from '@/lib/blog';
import { getAllIndustrySlugs } from '@/lib/industries';
import { getAllComparisonSlugs } from '@/lib/comparisons';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://opsapp.co';

  // Reflect the build/revalidate time so crawlers see fresh lastmod values.
  const lastUpdated = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: lastUpdated, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/platform`, lastModified: lastUpdated, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/plans`, lastModified: lastUpdated, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/journal`, lastModified: lastUpdated, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/industries`, lastModified: lastUpdated, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/compare`, lastModified: lastUpdated, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/company`, lastModified: lastUpdated, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/tools`, lastModified: lastUpdated, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/tools/leadership`, lastModified: lastUpdated, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/resources`, lastModified: lastUpdated, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/shop`, lastModified: lastUpdated, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/legal?page=terms`, lastModified: lastUpdated, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/legal?page=privacy`, lastModified: lastUpdated, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/legal?page=eula`, lastModified: lastUpdated, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const slugs = await getAllLiveSlugs();
  const blogPages: MetadataRoute.Sitemap = slugs.map((item) => ({
    url: `${baseUrl}/journal/${item.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const industrySlugs = getAllIndustrySlugs();
  const industryPages: MetadataRoute.Sitemap = industrySlugs.map((slug) => ({
    url: `${baseUrl}/industries/${slug}`,
    lastModified: lastUpdated,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const comparisonSlugs = getAllComparisonSlugs();
  const comparisonPages: MetadataRoute.Sitemap = comparisonSlugs.map((slug) => ({
    url: `${baseUrl}/compare/${slug}`,
    lastModified: lastUpdated,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  return [...staticPages, ...blogPages, ...industryPages, ...comparisonPages];
}
