'use client';

/**
 * SPEC Screens — Dev Preview (client)
 * Renders every (phase, tier) screen flat at progress=1 for QA — v2 tier
 * ids, real canvas fonts. No 3D. Visit: /spec/screens-dev
 */

import { useEffect, useRef, useState } from 'react';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/components/spec/phone-scene/constants';
import type { SpecPhase, SpecTierId } from '@/components/spec/phone-scene/constants';
import { resolveScreen } from '@/components/spec/phone-scene/SpecScreenRenderer';
import { ensureCanvasFonts } from '@/components/spec/phone-scene/hardware/canvas-fonts';

const ASPECT = CANVAS_WIDTH / CANVAS_HEIGHT;
const ACCENT = '#6F94B0';

interface ScreenDef {
  phase: SpecPhase;
  tier?: SpecTierId | null;
  label: string;
}

const ALL_SCREENS: ScreenDef[] = [
  { phase: 'home', label: 'Home (OPS app — hero)' },
  { phase: 'packages', label: 'Workflows (SPEC-01 — ladder zone)' },
  { phase: 'analysis', label: 'Backbone (SPEC-02 — board zone)' },
  { phase: 'building', label: 'Build console (SPEC-03 — build zone)' },
  { phase: 'custom', tier: 'spec01', label: 'Tier — SPEC-01 delivered' },
  { phase: 'custom', tier: 'spec02', label: 'Tier — SPEC-02 delivered' },
  { phase: 'custom', tier: 'spec03', label: 'Tier — SPEC-03 Deckset designer' },
];

function renderScreen(def: ScreenDef, targetWidth: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0A0A0A';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  try {
    const drawFn = resolveScreen(def.phase, def.tier ?? null);
    drawFn({ ctx, width: CANVAS_WIDTH, height: CANVAS_HEIGHT, progress: 1, tier: def.tier ?? null });
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

function ScreenCard({ screen, width, fontsReady }: { screen: ScreenDef; width: number; fontsReady: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container || !fontsReady) return;
    const canvas = renderScreen(screen, width);
    canvas.style.borderRadius = '6px';
    canvas.style.display = 'block';
    while (container.firstChild) container.removeChild(container.firstChild);
    container.appendChild(canvas);
  }, [screen, width, fontsReady]);

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 6, verticalAlign: 'top' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: 'monospace', fontWeight: 600 }}>
          {screen.phase}
        </span>
        {screen.tier && (
          <span style={{ color: ACCENT, fontSize: 11, fontFamily: 'monospace', padding: '2px 6px', borderRadius: 3, border: '1px solid rgba(111,148,176,0.3)', background: 'rgba(111,148,176,0.1)' }}>
            {screen.tier}
          </span>
        )}
      </div>
      <div ref={ref} style={{ width, height: width / ASPECT, borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }} />
      <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'monospace' }}>{screen.label}</span>
    </div>
  );
}

export default function SpecScreensDevClient() {
  const [cardWidth, setCardWidth] = useState(300);
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    ensureCanvasFonts().then(() => {
      if (!cancelled) setFontsReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', padding: 32, fontFamily: 'monospace' }}>
      <h1 style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, margin: '0 0 4px' }}>
        SPEC Screens — Dev Preview
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '0 0 12px' }}>
        Canvas 2D at progress=1. {CANVAS_WIDTH}&times;{CANVAS_HEIGHT}. v2 tiers. No 3D.
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>size:</span>
        <input type="range" min={180} max={500} value={cardWidth} onChange={(e) => setCardWidth(Number(e.target.value))} style={{ width: 160, accentColor: ACCENT }} />
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>{cardWidth}px</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        {ALL_SCREENS.map((s, i) => (
          <ScreenCard key={`${s.phase}-${s.tier ?? 'x'}-${i}`} screen={s} width={cardWidth} fontsReady={fontsReady} />
        ))}
      </div>
    </div>
  );
}
