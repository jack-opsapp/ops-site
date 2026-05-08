#!/usr/bin/env npx tsx
/**
 * Submit all sitemap URLs to IndexNow (Bing, Yandex, etc.)
 *
 * Usage:
 *   INDEXNOW_SECRET=your-secret npx tsx scripts/submit-indexnow.ts
 *
 * Or hit the deployed endpoint directly:
 *   curl -X POST https://opsapp.co/api/indexnow \
 *     -H "Authorization: Bearer $INDEXNOW_SECRET" \
 *     -H "Content-Type: application/json" \
 *     -d '{"urls":["https://opsapp.co","https://opsapp.co/platform"]}'
 */

const INDEXNOW_KEY = '3bd2eb345bec49dfbb9fedce61e5ad06';
const HOST = 'opsapp.co';
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

async function fetchSitemapUrls(): Promise<string[]> {
  const res = await fetch(`https://${HOST}/sitemap.xml`);
  const xml = await res.text();
  const urls: string[] = [];
  const regex = /<loc>(.*?)<\/loc>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    urls.push(match[1]);
  }
  return urls;
}

async function submitBatch(urls: string[]) {
  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  };

  const endpoints = [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow',
    'https://yandex.com/indexnow',
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload),
      });
      console.log(`  ${endpoint}: ${res.status} ${res.statusText}`);
    } catch (e) {
      console.error(`  ${endpoint}: FAILED - ${(e as Error).message}`);
    }
  }
}

async function main() {
  console.log('Fetching sitemap URLs...');
  const urls = await fetchSitemapUrls();
  console.log(`Found ${urls.length} URLs\n`);

  // IndexNow accepts max 10,000 per request
  const batchSize = 10000;
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    console.log(`Submitting batch ${Math.floor(i / batchSize) + 1} (${batch.length} URLs)...`);
    await submitBatch(batch);
  }

  console.log('\nDone. URLs submitted to IndexNow.');
}

main().catch(console.error);
