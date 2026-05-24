/**
 * Font loading helpers for next/og ImageResponse routes.
 *
 * Loads Mohave from Google Fonts at OG-image generation time so the
 * generated previews match the OPS marketing display type. Next.js
 * caches the fetch result automatically.
 */

const GOOGLE_FONTS_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function fetchGoogleFont(family: string, weight: number): Promise<ArrayBuffer> {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`;
  const css = await fetch(cssUrl, {
    headers: { 'User-Agent': GOOGLE_FONTS_UA },
  }).then((r) => r.text());

  const match = css.match(/src:\s*url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.(?:ttf|otf))\)/);
  if (!match) {
    throw new Error(`Could not resolve ${family} ${weight} from Google Fonts CSS`);
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
