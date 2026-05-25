/**
 * Font loading helpers for next/og ImageResponse routes.
 *
 * satori (the renderer behind next/og) accepts TTF and OTF, NOT WOFF2.
 *
 * Google Fonts has two CSS endpoints:
 *   - /css2?family=...   → returns WOFF2 (modern UAs)
 *   - /css?family=...    → returns TTF
 *
 * We use the CSS1 endpoint so the resolved font URL is a .ttf we can
 * pass straight to satori. Next.js caches the fetch automatically,
 * so each font loads once per build.
 */

async function fetchGoogleFont(family: string, weight: number): Promise<ArrayBuffer> {
  const cssUrl = `https://fonts.googleapis.com/css?family=${encodeURIComponent(family)}:${weight}&display=swap`;

  const css = await fetch(cssUrl).then((r) => r.text());

  const match = css.match(
    /src:\s*url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.ttf)\)\s*format\('truetype'\)/,
  );
  if (!match) {
    throw new Error(`Could not resolve ${family} ${weight} TTF from Google Fonts CSS`);
  }

  const fontRes = await fetch(match[1]);
  if (!fontRes.ok) {
    throw new Error(`Failed to download ${family} ${weight}: ${fontRes.status}`);
  }
  return fontRes.arrayBuffer();
}

export async function loadMohave(weight: 300 | 400 | 600 | 700 = 700): Promise<ArrayBuffer> {
  return fetchGoogleFont('Mohave', weight);
}

export async function loadJetBrainsMono(weight: 400 | 500 | 700 = 500): Promise<ArrayBuffer> {
  return fetchGoogleFont('JetBrains Mono', weight);
}
