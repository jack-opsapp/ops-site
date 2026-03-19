'use client';

/**
 * PhoneInteraction — Wires the 2D screen renderer to the 3D phone scene.
 *
 * Creates a CanvasTexture from the ScreenRenderer's canvas, applies it to
 * the phone screen mesh, handles raycasting for tab detection, and manages
 * cursor changes on hover.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  CanvasTexture,
  Raycaster,
  Vector2,
  SRGBColorSpace,
  type Mesh,
  type MeshBasicMaterial,
} from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { ScreenRenderer } from './ScreenRenderer';
import { CANVAS_HEIGHT, LAYOUT, TABS, type TabId } from './constants';

/** UV y threshold — below this value the click is in the tab bar zone */
const TAB_BAR_UV_THRESHOLD = LAYOUT.tabBarHeight / CANVAS_HEIGHT;

/** Max pointer movement (px) between down/up to count as a tap, not a drag */
const TAP_THRESHOLD_PX = 4;

interface PhoneInteractionProps {
  screenMesh: Mesh;
  controlsRef: React.MutableRefObject<OrbitControlsImpl | null>;
  invalidate: () => void;
  prefersReducedMotion?: boolean;
  onTabChange?: (tab: TabId) => void;
}

export default function PhoneInteraction({
  screenMesh,
  controlsRef,
  invalidate,
  prefersReducedMotion = false,
  onTabChange,
}: PhoneInteractionProps) {
  const rendererRef = useRef<ScreenRenderer | null>(null);
  const textureRef = useRef<CanvasTexture | null>(null);
  const { gl, camera } = useThree();
  const raycaster = useRef(new Raycaster());
  const pointer = useRef(new Vector2());
  const needsUpdate = useRef(false);

  // Track pointer-down position for click/drag disambiguation
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);

  // Initialize ScreenRenderer and CanvasTexture
  useEffect(() => {
    const renderer = new ScreenRenderer();
    rendererRef.current = renderer;

    const texture = new CanvasTexture(renderer.getCanvas());
    texture.colorSpace = SRGBColorSpace;
    textureRef.current = texture;

    // Apply texture to screen mesh material
    const material = screenMesh.material as MeshBasicMaterial;
    material.map = texture;
    material.needsUpdate = true;

    // When the renderer draws a frame, flag the texture dirty and wake
    // R3F's demand frame loop so useFrame runs to propagate the update.
    // Without the invalidate() call here, frameloop="demand" never ticks
    // and the initial draw-in animation shows a black screen.
    renderer.onFrame(() => {
      needsUpdate.current = true;
      invalidate();
    });

    // Reduced motion: render fully drawn instantly. No draw-in animation.
    if (prefersReducedMotion) {
      renderer.drawStatic();
    } else {
      renderer.startInitialDraw();
    }

    return () => {
      renderer.destroy();
      texture.dispose();
    };
  }, [screenMesh, invalidate, prefersReducedMotion]);

  // Propagate texture updates into the Three.js render cycle.
  // invalidate() is called from onFrame above to wake the loop;
  // this hook sets the actual texture flag so Three.js re-uploads.
  useFrame(() => {
    if (needsUpdate.current && textureRef.current) {
      textureRef.current.needsUpdate = true;
      needsUpdate.current = false;
    }
  });

  // --- Pointer down: record start position for drag disambiguation ---
  const handlePointerDown = useCallback((event: PointerEvent) => {
    pointerDownPos.current = { x: event.clientX, y: event.clientY };
  }, []);

  // --- Pointer up: only fire tab logic if movement < TAP_THRESHOLD_PX ---
  const handlePointerUp = useCallback(
    (event: PointerEvent) => {
      if (!rendererRef.current || !pointerDownPos.current) return;

      // Measure drag distance — if too large this was an orbit, not a tap
      const dx = event.clientX - pointerDownPos.current.x;
      const dy = event.clientY - pointerDownPos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      pointerDownPos.current = null;

      if (dist >= TAP_THRESHOLD_PX) return;

      // Calculate pointer position in NDC (-1 to +1)
      const rect = gl.domElement.getBoundingClientRect();
      pointer.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Raycast against screen mesh
      raycaster.current.setFromCamera(pointer.current, camera);
      const intersects = raycaster.current.intersectObject(screenMesh);

      if (intersects.length > 0) {
        const uv = intersects[0].uv;
        if (!uv) return;

        // UV y < threshold → bottom of screen → tab bar zone
        if (uv.y < TAB_BAR_UV_THRESHOLD) {
          const tabIndex = Math.floor(uv.x * 4);
          const clampedIndex = Math.max(0, Math.min(3, tabIndex));
          const tab = TABS[clampedIndex];

          if (tab && tab.id !== rendererRef.current.getActiveTab()) {
            if (prefersReducedMotion) {
              rendererRef.current.switchTabInstant(tab.id);
            } else {
              rendererRef.current.switchTab(tab.id);
            }
            onTabChange?.(tab.id);
          }
        }
      }
    },
    [screenMesh, camera, gl.domElement, onTabChange, prefersReducedMotion],
  );

  // --- Hover: pointer over tab bar, grab over phone screen, default elsewhere ---
  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      pointer.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(pointer.current, camera);
      const intersects = raycaster.current.intersectObject(screenMesh);

      if (intersects.length > 0 && intersects[0].uv) {
        const uv = intersects[0].uv;
        if (uv.y < TAB_BAR_UV_THRESHOLD) {
          gl.domElement.style.cursor = 'pointer';
        } else {
          gl.domElement.style.cursor = 'grab';
        }
      } else {
        // Raycast missed the phone — default cursor, not grab
        gl.domElement.style.cursor = 'default';
      }
    },
    [screenMesh, camera, gl.domElement],
  );

  // --- Leave: reset cursor to default ---
  const handlePointerLeave = useCallback(() => {
    gl.domElement.style.cursor = 'default';
  }, [gl.domElement]);

  // Attach / detach event listeners on the canvas element
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [gl.domElement, handlePointerDown, handlePointerUp, handlePointerMove, handlePointerLeave]);

  // Behaviour-only component — no visual output
  return null;
}
