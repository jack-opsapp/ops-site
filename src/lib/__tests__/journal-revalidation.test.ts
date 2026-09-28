/**
 * Journal on-demand revalidation — POST /api/revalidate/journal.
 *
 * ops-web calls it after every write to blog_posts so a published, edited
 * or unpublished article reaches the static site immediately instead of
 * within the 5-minute ISR window.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  JOURNAL_DEPENDENT_ROUTES,
  MAX_SLUGS,
  handleJournalRevalidation,
} from '../journal-revalidation';

const SECRET = 'test-secret-value';
const NOW = new Date('2026-09-28T20:00:00.000Z');

type Call = [string, ('page' | 'layout')?];

function run(init: { auth?: string | null; body?: string; secret?: string | undefined }) {
  const calls: Call[] = [];
  const headers = new Headers({ 'content-type': 'application/json' });
  if (init.auth !== null) headers.set('authorization', init.auth ?? `Bearer ${SECRET}`);
  const request = new Request('https://opsapp.co/api/revalidate/journal', {
    method: 'POST',
    headers,
    body: init.body,
  });
  const response = handleJournalRevalidation(request, {
    secret: 'secret' in init ? init.secret : SECRET,
    revalidatePath: (path, type) => {
      calls.push(type ? [path, type] : [path]);
    },
    now: () => NOW,
  });
  return { response, calls };
}

describe('auth', () => {
  it('500 when the secret is not configured', async () => {
    const { response, calls } = run({ secret: undefined, body: '{}' });
    const res = await response;
    assert.equal(res.status, 500);
    assert.equal(calls.length, 0);
  });

  it('401 without an Authorization header', async () => {
    const { response, calls } = run({ auth: null, body: '{}' });
    assert.equal((await response).status, 401);
    assert.equal(calls.length, 0);
  });

  it('401 with the wrong bearer (same length and different length)', async () => {
    for (const auth of [`Bearer ${'x'.repeat(SECRET.length)}`, 'Bearer nope', SECRET]) {
      const { response, calls } = run({ auth, body: '{}' });
      assert.equal((await response).status, 401);
      assert.equal(calls.length, 0);
    }
  });
});

describe('body validation', () => {
  const bad = [
    'not json',
    '[]',
    '"slug"',
    '{"slugs":"one"}',
    '{"slugs":[1]}',
    '{"slugs":["Has-Caps"]}',
    '{"slugs":["../etc"]}',
    '{"slugs":["trailing-"]}',
    `{"slugs":${JSON.stringify(Array.from({ length: MAX_SLUGS + 1 }, (_, i) => `post-${i}`))}}`,
  ];
  for (const body of bad) {
    it(`400 for ${body.slice(0, 40)}`, async () => {
      const { response, calls } = run({ body });
      assert.equal((await response).status, 400);
      assert.equal(calls.length, 0);
    });
  }
});

describe('revalidation', () => {
  const dependent: Call[] = JOURNAL_DEPENDENT_ROUTES.map(({ path, type }) =>
    type ? [path, type] : [path],
  );

  it('revalidates every journal-dependent route with an empty body', async () => {
    const { response, calls } = run({ body: '' });
    const res = await response;
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('cache-control'), 'no-store');
    assert.deepEqual(calls, dependent);
    assert.deepEqual(await res.json(), {
      revalidated: dependent.map(([path, type]) => (type ? `${path} (${type})` : path)),
      slugs: [],
      at: NOW.toISOString(),
    });
  });

  it('also revalidates each named article path, deduplicated', async () => {
    const { response, calls } = run({
      body: JSON.stringify({ slugs: ['new-post', 'old-post-2025', 'new-post'] }),
    });
    const res = await response;
    assert.equal(res.status, 200);
    assert.deepEqual(calls, [...dependent, ['/journal/new-post'], ['/journal/old-post-2025']]);
    const json = await res.json();
    assert.deepEqual(json.slugs, ['new-post', 'old-post-2025']);
  });

  it('accepts {} and {"slugs":[]}', async () => {
    for (const body of ['{}', '{"slugs":[]}']) {
      const { response, calls } = run({ body });
      assert.equal((await response).status, 200);
      assert.deepEqual(calls, dependent);
    }
  });
});

/* -------------------------------------------------------------------------- */
/*  Coverage: every route that renders journal data is revalidated            */
/* -------------------------------------------------------------------------- */

const SRC = fileURLToPath(new URL('../../', import.meta.url));
const APP = join(SRC, 'app');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

function resolveImport(fromFile: string, specifier: string): string | null {
  let base: string;
  if (specifier.startsWith('@/')) base = join(SRC, specifier.slice(2));
  else if (specifier.startsWith('.')) base = join(dirname(fromFile), specifier);
  else return null;
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, join(base, 'index.ts'), join(base, 'index.tsx')]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

function importsOf(file: string): string[] {
  const source = readFileSync(file, 'utf8');
  const specs = [...source.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
  return specs.map((spec) => resolveImport(file, spec)).filter((f): f is string => f !== null);
}

/** Route file → the path its revalidation is keyed on. */
function routeKeyFor(file: string): string {
  const rel = relative(APP, file).split(sep).join('/');
  if (rel === 'sitemap.ts') return '/sitemap.xml';
  const dir = rel.replace(/\/?page\.tsx$/, '');
  const dynamic = dir.includes('[');
  // Dynamic routes are revalidated by their group-qualified pattern; static
  // routes by their URL (route groups are not part of the URL).
  if (dynamic) return `/${dir}`;
  const url = `/${dir.split('/').filter((s) => !/^\(.*\)$/.test(s)).join('/')}`;
  return url === '/' ? '/' : url.replace(/\/$/, '');
}

describe('JOURNAL_DEPENDENT_ROUTES coverage', () => {
  const blog = join(SRC, 'lib', 'blog.ts');
  const allFiles = walk(SRC).filter(
    (f) => /\.(ts|tsx)$/.test(f) && !f.includes(`${sep}__tests__${sep}`),
  );

  // Modules that render journal data, directly or through another module.
  const journalModules = new Set<string>([blog]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const file of allFiles) {
      if (journalModules.has(file)) continue;
      if (importsOf(file).some((dep) => journalModules.has(dep))) {
        journalModules.add(file);
        grew = true;
      }
    }
  }

  const journalRoutes = [...journalModules]
    .filter((f) => f.startsWith(APP) && (/[/\\]page\.tsx$/.test(f) || f === join(APP, 'sitemap.ts')))
    .map(routeKeyFor)
    .sort();

  const covered = new Set(JOURNAL_DEPENDENT_ROUTES.map(({ path }) => path));

  it('finds the known journal consumers', () => {
    for (const route of ['/journal', '/(en)/journal/[slug]', '/', '/es', '/sitemap.xml']) {
      assert.ok(journalRoutes.includes(route), `${route} not detected: ${journalRoutes.join(', ')}`);
    }
  });

  it('revalidates every route that renders journal data', () => {
    const missing = journalRoutes.filter((route) => !covered.has(route));
    assert.deepEqual(missing, []);
  });

  it('every typed pattern names an existing route file', () => {
    for (const { path, type } of JOURNAL_DEPENDENT_ROUTES) {
      if (!type) continue;
      assert.equal(type, 'page');
      assert.ok(existsSync(join(APP, ...path.slice(1).split('/'), 'page.tsx')), path);
    }
  });

  it('every concrete path is a real route', () => {
    for (const { path, type } of JOURNAL_DEPENDENT_ROUTES) {
      if (type) continue;
      const file =
        path === '/sitemap.xml'
          ? join(APP, 'sitemap.ts')
          : path === '/es' || path.startsWith('/es/')
            ? join(APP, '(es)', ...path.slice(1).split('/'), 'page.tsx')
            : join(APP, '(en)', ...path.split('/').filter(Boolean), 'page.tsx');
      assert.ok(existsSync(file), `${path} → ${relative(APP, file)}`);
    }
  });
});
