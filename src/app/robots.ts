import type { MetadataRoute } from 'next';

/**
 * Robots.txt
 *
 * Important: per the robots.txt spec, a named user-agent block REPLACES the
 * wildcard block entirely for that bot — it does not merge. So each named
 * AI crawler must repeat the same disallow list, otherwise we're telling
 * GPTBot / ClaudeBot / etc. they can crawl /api/, /shop/checkout, dev
 * pages, and noindex internal routes.
 */

const DISALLOW = [
  '/api/',
  '/_next/',
  '/shop/checkout',
  '/shop/confirmation',
  '/tools/leadership/results/',
  '/tools/leadership/demo',
  '/tools/leadership/assess',
  '/platform/screens-dev',
  '/spec/screens-dev',
  '/spec/confirmation',
];

/**
 * Major AI / LLM crawlers. We allow them at the root but apply the same
 * disallow list as the wildcard rule so they don't crawl checkout flows,
 * dev pages, or noindex internal routes.
 */
const AI_CRAWLERS = [
  'GPTBot',
  'Google-Extended',
  'ChatGPT-User',
  'ClaudeBot',
  'PerplexityBot',
  'Applebot-Extended',
  'Bytespider',
  'CCBot',
  'Amazonbot',
  'YouBot',
  'cohere-ai',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: DISALLOW },
      ...AI_CRAWLERS.map((bot) => ({
        userAgent: bot,
        allow: '/',
        disallow: DISALLOW,
      })),
    ],
    sitemap: 'https://opsapp.co/sitemap.xml',
  };
}
