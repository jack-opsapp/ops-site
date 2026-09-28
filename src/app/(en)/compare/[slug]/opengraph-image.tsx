/**
 * Dynamic Open Graph image for /compare/[slug].
 *
 * Renders "OPS vs {Competitor}" as a 1200×630 OPS-branded preview.
 * Generated at build time for every static param produced by the
 * parent page.
 */

import { ImageResponse } from 'next/og';
import { getComparisonBySlug } from '@/lib/comparisons';
import { loadMohave, loadJetBrainsMono } from '@/lib/og-fonts';

export const alt = 'OPS — Compared.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function OpenGraphImage({ params }: Props) {
  const { slug } = await params;
  const comparison = getComparisonBySlug(slug);

  const competitorName = comparison?.competitorName ?? 'Competitor';

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
          [ HONEST COMPARISON ]
        </div>

        {/* Headline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: 'auto',
            color: '#F0F0F0',
            fontWeight: 700,
            lineHeight: 0.95,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
          }}
        >
          <div style={{ fontSize: 130 }}>OPS</div>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 28,
              marginTop: 8,
            }}
          >
            <span style={{ fontSize: 64, color: '#6F94B0' }}>vs</span>
            <span style={{ fontSize: 110 }}>{competitorName}</span>
          </div>
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
