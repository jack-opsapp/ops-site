/**
 * Dynamic Open Graph image for /industries/[slug].
 *
 * Renders a 1200×630 OPS-branded preview per industry. Generated at
 * build time for every static param produced by the parent page.
 */

import { ImageResponse } from 'next/og';
import { getIndustryBySlug } from '@/lib/industries';
import { loadMohave, loadJetBrainsMono } from '@/lib/og-fonts';

export const alt = 'OPS — Built for trades';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function OpenGraphImage({ params }: Props) {
  const { slug } = await params;
  const industry = getIndustryBySlug(slug);

  const sectionLabel = industry?.content.en.hero.sectionLabel ?? 'INDUSTRIES';
  const headline = industry?.content.en.hero.headline ?? 'Built for trades.';

  const [mohaveBold, monoMedium] = await Promise.all([loadMohave(700), loadJetBrainsMono(500)]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0A0A0A',
          display: 'flex',
          flexDirection: 'column',
          padding: '80px',
          fontFamily: 'Mohave',
        }}
      >
        {/* Top eyebrow */}
        <div
          style={{
            display: 'flex',
            color: '#6F94B0',
            fontFamily: 'JetBrains Mono',
            fontSize: 22,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
          }}
        >
          [ INDUSTRIES / {sectionLabel} ]
        </div>

        {/* Headline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: 'auto',
            color: '#F0F0F0',
            fontSize: 110,
            fontWeight: 700,
            lineHeight: 0.95,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
          }}
        >
          {headline}
        </div>

        {/* Accent + lockup */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            marginTop: 56,
          }}
        >
          <div style={{ width: 64, height: 2, background: '#6F94B0' }} />
          <div
            style={{
              color: '#F0F0F0',
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: '0.4em',
            }}
          >
            OPS
          </div>
          <div
            style={{
              color: '#6A6A6A',
              fontFamily: 'JetBrains Mono',
              fontSize: 18,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginLeft: 'auto',
            }}
          >
            opsapp.co
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Mohave', data: mohaveBold, weight: 700, style: 'normal' },
        { name: 'JetBrains Mono', data: monoMedium, weight: 500, style: 'normal' },
      ],
    },
  );
}
