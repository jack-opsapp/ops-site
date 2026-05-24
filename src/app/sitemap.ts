import type { MetadataRoute } from 'next';
import { getAllLiveSlugs } from '@/lib/blog';
import { getAllIndustrySlugs } from '@/lib/industries';
import { getAllComparisonSlugs } from '@/lib/comparisons';

const BASE_URL = 'https://opsapp.co';

/**
 * Build one English + one Spanish sitemap entry for a given path.
 * Each entry includes `alternates.languages` so Google's hreflang
 * graph is fully connected from the sitemap itself.
 */
function buildLocaleEntries(
  path: string,
  options: {
    lastModified: Date;
    changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;
    priority: number;
  },
): MetadataRoute.Sitemap {
  const cleanPath = path === '/' ? '' : path;
  const enUrl = `${BASE_URL}${cleanPath}` || BASE_URL;
  const esUrl = `${BASE_URL}/es${cleanPath}`;
  const languages = {
    en: enUrl,
    es: esUrl,
    'x-default': enUrl,
  };
  return [
    {
      url: enUrl,
      lastModified: options.lastModified,
      changeFrequency: options.changeFrequency,
      priority: options.priority,
      alternates: { languages },
    },
    {
      url: esUrl,
      lastModified: options.lastModified,
      changeFrequency: options.changeFrequency,
      priority: options.priority,
      alternates: { languages },
    },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Reflect the build/revalidate time so crawlers see fresh lastmod values.
  const lastUpdated = new Date();

  const staticPaths: Array<{
    path: string;
    changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;
    priority: number;
  }> = [
    { path: '/', changeFrequency: 'weekly', priority: 1 },
    { path: '/platform', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/plans', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/journal', changeFrequency: 'daily', priority: 0.8 },
    { path: '/industries', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/compare', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/company', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/tools', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/tools/leadership', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/resources', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/shop', changeFrequency: 'monthly', priority: 0.5 },
  ];

  const staticPages = staticPaths.flatMap((page) =>
    buildLocaleEntries(page.path, {
      lastModified: lastUpdated,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    }),
  );

  // Legal docs are English-only (see englishOnlyNotice on the legal page);
  // no /es variant gets a sitemap entry.
  const legalPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/legal?page=terms`, lastModified: lastUpdated, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/legal?page=privacy`, lastModified: lastUpdated, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/legal?page=eula`, lastModified: lastUpdated, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const blogSlugs = await getAllLiveSlugs();
  const blogPages = blogSlugs.flatMap((item) =>
    buildLocaleEntries(`/journal/${item.slug}`, {
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }),
  );

  const industryPages = getAllIndustrySlugs().flatMap((slug) =>
    buildLocaleEntries(`/industries/${slug}`, {
      lastModified: lastUpdated,
      changeFrequency: 'monthly',
      priority: 0.8,
    }),
  );

  const comparisonPages = getAllComparisonSlugs().flatMap((slug) =>
    buildLocaleEntries(`/compare/${slug}`, {
      lastModified: lastUpdated,
      changeFrequency: 'monthly',
      priority: 0.9,
    }),
  );

  return [...staticPages, ...legalPages, ...blogPages, ...industryPages, ...comparisonPages];
}
