'use client';

/**
 * SpecPhoneInteraction — wires the 2D screen renderer to the 3D phone.
 *
 * Creates a CanvasTexture from the SpecScreenRenderer's canvas, applies it
 * as the screen's emissive map, reacts to page phase/tier changes, and
 * raycasts pointer movement for hover (auto-rotation slowdown) and cursor
 * recoil. The spec phone is scroll-driven — pointer taps never navigate;
 * the page owns the screen.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  CanvasTexture,
  Raycaster,
  Vector2,
  SRGBColorSpace,
  LinearFilter,
  LinearMipmapLinearFilter,
  type Mesh,
  type MeshPhysicalMaterial,
} from 'three';
import { SpecScreenRenderer } from './SpecScreenRenderer';
import { ensureCanvasFonts } from './hardware/canvas-fonts';
import type { SpecPhase, SpecTierId } from './constants';

interface SpecPhoneInteractionProps {
  screenMesh: Mesh;
  invalidate: () => void;
  prefersReducedMotion: boolean;
  isVisible: boolean;
  phase: SpecPhase;
  tier: SpecTierId | null;
  onHoverChange?: (hovering: boolean) => void;
  onCursorOffset?: (offset: { x: number; y: number } | null) => void;
}

export default function SpecPhoneInteraction({
  screenMesh,
  invalidate,
  prefersReducedMotion,
  isVisible,
  phase,
  tier,
  onHoverChange,
  onCursorOffset,
}: SpecPhoneInteractionProps) {
  const rendererRef = useRef<SpecScreenRenderer | null>(null);
  const textureRef = useRef<CanvasTexture | null>(null);
  const { gl, camera } = useThree();
  const raycaster = useRef(new Raycaster());
  const pointer = useRef(new Vector2());
  const needsUpdate = useRef(false);

  // The mount-time page state — the first draw lands on the visitor's actual
  // phase (deep-link entry), not a home flash. Refs, not deps: the init
  // effect must not re-run on phase changes (the switch effect owns those).
  const initialPhase = useRef(phase);
  const initialTier = useRef(tier);
  const initialReduced = useRef(prefersReducedMotion);
  initialPhase.current = phase;
  initialTier.current = tier;
  initialReduced.current = prefersReducedMotion;

  // Initialize renderer + texture
  useEffect(() => {
    const renderer = new SpecScreenRenderer();
    rendererRef.current = renderer;

    const texture = new CanvasTexture(renderer.getCanvas());
    texture.colorSpace = SRGBColorSpace;
    // Sharp at oblique angles — max anisotropy prevents blur when tilted
    texture.anisotropy = gl.capabilities.getMaxAnisotropy();
    texture.generateMipmaps = true;
    texture.minFilter = LinearMipmapLinearFilter;
    texture.magFilter = LinearFilter;
    textureRef.current = texture;

    // Emissive screen: the texture drives self-illumination (a real OLED);
    // the material's glass layer rides on top and sheds via the glass
    // channel. 1.15 so the UI content is the first thing the eye lands on —
    // the screen reads before the hardware, as a powered-on phone would.
    const material = screenMesh.material as MeshPhysicalMaterial;
    material.emissive.set('#FFFFFF');
    material.emissiveMap = texture;
    material.emissiveIntensity = 1.15;
    material.needsUpdate = true;

    // Register onFrame BEFORE the first draw so the texture dirty flag +
    // invalidate() fire on that first render.
    renderer.onFrame(() => {
      needsUpdate.current = true;
      invalidate();
    });

    // First render waits for canvas font registration (timeout-bounded —
    // paint can't hang). Draw the visitor's actual entry state.
    let disposed = false;
    ensureCanvasFonts().then(() => {
      if (disposed) return;
      renderer.setInitial(initialPhase.current, initialTier.current);
      if (initialReduced.current) {
        renderer.drawStatic();
      } else {
        renderer.startInitialDraw();
      }
    });

    return () => {
      disposed = true;
      renderer.destroy();
      texture.dispose();
    };
  }, [screenMesh, invalidate, gl.capabilities]);

  // Page phase/tier drives the screen
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    if (prefersReducedMotion) {
      renderer.switchPhaseInstant(phase, tier);
    } else {
      renderer.switchPhase(phase, tier);
    }
  }, [phase, tier, prefersReducedMotion]);

  // Pause the RAF loop when scrolled off-screen
  useEffect(() => {
    rendererRef.current?.setPaused(!isVisible);
  }, [isVisible]);

  // Propagate texture updates into the Three.js render cycle
  useFrame(() => {
    if (needsUpdate.current && textureRef.current) {
      textureRef.current.needsUpdate = true;
      needsUpdate.current = false;
    }
  });

  // --- Hover raycast: auto-rotation slowdown + cursor recoil ---
  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      pointer.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(pointer.current, camera);
      const intersects = raycaster.current.intersectObject(screenMesh);
      const hit = intersects.length > 0 ? intersects[0].uv : undefined;

      onHoverChange?.(hit != null);
      if (hit != null) {
        gl.domElement.style.cursor = 'grab';
        onCursorOffset?.({ x: (hit.x - 0.5) * 2, y: (hit.y - 0.5) * 2 });
      } else {
        gl.domElement.style.cursor = 'default';
        onCursorOffset?.(null);
      }
    },
    [screenMesh, camera, gl.domElement, onHoverChange, onCursorOffset],
  );

  const handlePointerLeave = useCallback(() => {
    gl.domElement.style.cursor = 'default';
    onHoverChange?.(false);
    onCursorOffset?.(null);
  }, [gl.domElement, onHoverChange, onCursorOffset]);

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerleave', handlePointerLeave);
    return () => {
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [gl.domElement, handlePointerMove, handlePointerLeave]);

  return null;
}
