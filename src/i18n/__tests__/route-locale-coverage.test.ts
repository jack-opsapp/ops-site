/**
 * Route ↔ locale coverage.
 *
 * Pages render statically because each one learns its locale from its
 * route group instead of the request. These tests keep that true as the
 * site grows:
 *   - every page and layout sets the locale of its group,
 *   - the Spanish route files and TRANSLATED_PATHS never drift apart,
 *   - no page-rendering code reads request headers/cookies except the
 *     modules that genuinely need per-request data.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { TRANSLATED_PATHS } from '../routes';

const SRC = fileURLToPath(new URL('../../', import.meta.url));
const APP = join(SRC, 'app');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const routeFiles = (group: string) =>
  walk(join(APP, group)).filter((file) => /[/\\](page|layout)\.tsx$/.test(file));

describe('every route declares its locale', () => {
  for (const [group, locale] of [['(en)', 'en'], ['(es)', 'es']] as const) {
    const files = routeFiles(group);

    it(`${group} has route files`, () => {
      assert.ok(files.length > 0);
    });

    for (const file of files) {
      it(`${relative(APP, file)} calls setRequestLocale('${locale}')`, () => {
        const source = readFileSync(file, 'utf8');
        assert.match(source, new RegExp(`setRequestLocale\\('${locale}'\\)`));
        const other = locale === 'en' ? 'es' : 'en';
        assert.doesNotMatch(source, new RegExp(`setRequestLocale\\('${other}'\\)`));
      });
    }
  }
});

describe('Spanish routes match TRANSLATED_PATHS', () => {
  it('has exactly one /es page per translated path', () => {
    const spanishRoot = join(APP, '(es)', 'es');
    const routes = walk(spanishRoot)
      .filter((file) => file.endsWith(`${sep}page.tsx`))
      .map((file) => {
        const dir = relative(spanishRoot, file).replace(/[/\\]?page\.tsx$/, '');
        return dir === '' ? '/' : `/${dir.split(sep).join('/')}`;
      })
      .sort();
    assert.deepEqual(routes, [...TRANSLATED_PATHS].sort());
  });
});

describe('rendering code does not read the request', () => {
  // The only rendering modules allowed to read headers/cookies: the SPEC
  // buyer checkout (it resolves the signed-in buyer per request).
  const ALLOWED = new Set([
    join(APP, '(en)', 'spec', 'checkout', '[buyer_checkout_token]', 'page.tsx'),
  ]);

  const renderingFiles = [
    ...walk(join(APP, '(en)')),
    ...walk(join(APP, '(es)')),
    ...walk(join(APP, '_localized')),
    ...walk(join(SRC, 'components')),
    ...walk(join(SRC, 'i18n')),
  ].filter((file) => /\.(ts|tsx)$/.test(file) && !file.includes(`${sep}__tests__${sep}`));

  it('only allowed modules import next/headers', () => {
    const offenders = renderingFiles
      .filter((file) => /from ['"]next\/headers['"]/.test(readFileSync(file, 'utf8')))
      .filter((file) => !ALLOWED.has(file))
      .map((file) => relative(SRC, file));
    assert.deepEqual(offenders, []);
  });
});
