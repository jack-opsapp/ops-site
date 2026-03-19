'use client';

import { useEffect, useRef, useState } from 'react';
import { ScreenRenderer } from '../../../components/platform/phone-scene/ScreenRenderer';
import { TABS } from '../../../components/platform/phone-scene/constants';
import type { TabId } from '../../../components/platform/phone-scene/constants';

const STATIC_WIDTH = 300;
const INTERACTIVE_WIDTH = 400;
const ASPECT = 750 / 1540;

/** Mount a ScreenRenderer's canvas into a container div, scaled to targetWidth */
function useStaticRenderer(tab: TabId, targetWidth: number) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderer = new ScreenRenderer();
    renderer.drawStatic(tab);

    const canvas = renderer.getCanvas();
    canvas.style.width = `${targetWidth}px`;
    canvas.style.height = `${targetWidth / ASPECT}px`;

    const container = containerRef.current;
    if (container) {
      container.appendChild(canvas);
    }

    return () => {
      renderer.destroy();
      if (container && canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    };
  }, [tab, targetWidth]);

  return containerRef;
}

/** Static preview card for a single tab */
function StaticPreview({ tab }: { tab: TabId }) {
  const ref = useStaticRenderer(tab, STATIC_WIDTH);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div
        ref={ref}
        style={{
          width: STATIC_WIDTH,
          height: STATIC_WIDTH / ASPECT,
          borderRadius: 8,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      />
      <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontFamily: 'monospace' }}>
        {tab}
      </span>
    </div>
  );
}

/** Interactive preview with tab switching and draw-in animations */
function InteractivePreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<ScreenRenderer | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('home');

  useEffect(() => {
    const renderer = new ScreenRenderer();
    rendererRef.current = renderer;

    const canvas = renderer.getCanvas();
    canvas.style.width = `${INTERACTIVE_WIDTH}px`;
    canvas.style.height = `${INTERACTIVE_WIDTH / ASPECT}px`;

    const container = containerRef.current;
    if (container) {
      container.appendChild(canvas);
    }

    renderer.startInitialDraw();

    return () => {
      renderer.destroy();
      rendererRef.current = null;
      if (container && canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    };
  }, []);

  const handleTabClick = (tab: TabId) => {
    setActiveTab(tab);
    rendererRef.current?.switchTab(tab);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => handleTabClick(t.id)}
            style={{
              padding: '6px 16px',
              borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.15)',
              background: activeTab === t.id ? '#597794' : 'rgba(255,255,255,0.05)',
              color: activeTab === t.id ? '#fff' : 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              fontSize: 13,
              fontFamily: 'monospace',
            }}
          >
            {t.id}
          </button>
        ))}
      </div>
      <div
        ref={containerRef}
        style={{
          width: INTERACTIVE_WIDTH,
          height: INTERACTIVE_WIDTH / ASPECT,
          borderRadius: 8,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      />
    </div>
  );
}

export default function ScreensDevPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0A0A0A',
        padding: 40,
        display: 'flex',
        flexDirection: 'column',
        gap: 48,
      }}
    >
      <div>
        <h1
          style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: 20,
            fontFamily: 'monospace',
            margin: '0 0 8px',
          }}
        >
          Wireframe Screens — Dev Preview
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontFamily: 'monospace', margin: 0 }}>
          Canvas 2D output at full progress. No 3D scene.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <StaticPreview key={t.id} tab={t.id} />
        ))}
      </div>

      <div>
        <h2
          style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: 16,
            fontFamily: 'monospace',
            margin: '0 0 16px',
          }}
        >
          Interactive — click tabs to test transitions
        </h2>
        <InteractivePreview />
      </div>
    </div>
  );
}
