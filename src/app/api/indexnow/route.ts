import { NextResponse } from 'next/server';

const INDEXNOW_KEY = '3bd2eb345bec49dfbb9fedce61e5ad06';
const HOST = 'opsapp.co';
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.INDEXNOW_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const urls: string[] = body.urls;

  if (!urls?.length) {
    return NextResponse.json({ error: 'No URLs provided' }, { status: 400 });
  }

  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  };

  const results = await Promise.allSettled([
    fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    }),
    fetch('https://www.bing.com/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    }),
    fetch('https://yandex.com/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    }),
  ]);

  const summary = results.map((r, i) => {
    const endpoint = ['indexnow.org', 'bing.com', 'yandex.com'][i];
    if (r.status === 'fulfilled') {
      return { endpoint, status: r.value.status, ok: r.value.ok };
    }
    return { endpoint, status: 0, ok: false, error: (r.reason as Error).message };
  });

  return NextResponse.json({ submitted: urls.length, results: summary });
}
