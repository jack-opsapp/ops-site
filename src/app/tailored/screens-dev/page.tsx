'use client';

/**
 * Tailored Screens — Dev Preview
 * Lightweight: DPR 1, renders on mount. No site chrome needed.
 * Visit: /tailored/screens-dev
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/components/tailored/phone-scene/constants';
import type { TailoredPhase } from '@/components/tailored/phone-scene/constants';
import type { TailoredScreenDrawFn } from '@/components/tailored/phone-scene/screens/types';

import { drawTailoredHome } from '@/components/tailored/phone-scene/screens/tailored-home';
import { drawTailoredPackages } from '@/components/tailored/phone-scene/screens/tailored-packages';
import { drawTailoredAnalysis } from '@/components/tailored/phone-scene/screens/tailored-analysis';
import { drawTailoredBuilding } from '@/components/tailored/phone-scene/screens/tailored-building';
import { drawTailoredCustom } from '@/components/tailored/phone-scene/screens/tailored-custom';

const ASPECT = CANVAS_WIDTH / CANVAS_HEIGHT;

const SCREEN_MAP: Record<TailoredPhase, TailoredScreenDrawFn> = {
  home: drawTailoredHome,
  packages: drawTailoredPackages,
  analysis: drawTailoredAnalysis,
  building: drawTailoredBuilding,
  custom: drawTailoredCustom,
};

type Tier = 'setup' | 'build' | 'enterprise';

interface ScreenDef {
  phase: TailoredPhase;
  tier?: Tier | null;
  label: string;
}

const ALL_SCREENS: ScreenDef[] = [
  { phase: 'home', label: 'Home (base OPS)' },
  { phase: 'packages', label: 'Packages (no selection)' },
  { phase: 'packages', tier: 'build', label: 'Packages (build selected)' },
  { phase: 'analysis', label: 'Analysis' },
  { phase: 'building', label: 'Building' },
  { phase: 'custom', tier: 'setup', label: 'Custom — Setup' },
  { phase: 'custom', tier: 'build', label: 'Custom — Build (Deck Builder)' },
  { phase: 'custom', tier: 'enterprise', label: 'Custom — Enterprise' },
];

function renderScreen(drawFn: TailoredScreenDrawFn, tier: Tier | null | undefined, targetWidth: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0A0A0A';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  try {
    drawFn({ ctx, width: CANVAS_WIDTH, height: CANVAS_HEIGHT, progress: 1, tier: tier ?? undefined });
  } catch (e) {
    console.error('Draw error:', e);
    ctx.fillStyle = 'red';
    ctx.font = '24px monospace';
    ctx.fillText(String(e), 20, 40);
  }

  canvas.style.width = `${targetWidth}px`;
  canvas.style.height = `${targetWidth / ASPECT}px`;
  return canvas;
}

function ScreenCard({ screen, width }: { screen: ScreenDef; width: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const drawFn = SCREEN_MAP[screen.phase];
    const canvas = renderScreen(drawFn, screen.tier, width);
    canvas.style.borderRadius = '6px';
    canvas.style.display = 'block';
    while (container.firstChild) container.removeChild(container.firstChild);
    container.appendChild(canvas);
  }, [screen, width]);

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 6, verticalAlign: 'top' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: 'monospace', fontWeight: 600 }}>
          {screen.phase}
        </span>
        {screen.tier && (
          <span style={{ color: '#597794', fontSize: 11, fontFamily: 'monospace', padding: '2px 6px', borderRadius: 3, border: '1px solid rgba(89,119,148,0.3)', background: 'rgba(89,119,148,0.1)' }}>
            {screen.tier}
          </span>
        )}
      </div>
      <div ref={ref} style={{ width, height: width / ASPECT, borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }} />
      <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'monospace' }}>{screen.label}</span>
    </div>
  );
}

export default function TailoredScreensDevPage() {
  const [cardWidth, setCardWidth] = useState(300);

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', padding: 32, fontFamily: 'monospace' }}>
      <h1 style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, margin: '0 0 4px' }}>
        Tailored Screens — Dev Preview
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '0 0 12px' }}>
        Canvas 2D at progress=1. {CANVAS_WIDTH}&times;{CANVAS_HEIGHT}. No 3D.
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>size:</span>
        <input type="range" min={180} max={500} value={cardWidth} onChange={(e) => setCardWidth(Number(e.target.value))} style={{ width: 160, accentColor: '#597794' }} />
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>{cardWidth}px</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        {ALL_SCREENS.map((s, i) => (
          <ScreenCard key={`${s.phase}-${s.tier ?? 'x'}-${i}`} screen={s} width={cardWidth} />
        ))}
      </div>
    </div>
  );
}
