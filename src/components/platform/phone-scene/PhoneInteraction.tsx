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

interface PhoneInteractionProps {
  screenMesh: Mesh;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  invalidate: () => void;
  onTabChange?: (tab: TabId) => void;
}

export default function PhoneInteraction({
  screenMesh,
  controlsRef,
  invalidate,
  onTabChange,
}: PhoneInteractionProps) {
  const rendererRef = useRef<ScreenRenderer | null>(null);
  const textureRef = useRef<CanvasTexture | null>(null);
  const { gl, camera } = useThree();
  const raycaster = useRef(new Raycaster());
  const pointer = useRef(new Vector2());
  const needsUpdate = useRef(false);

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

    // Flag texture update whenever renderer draws a frame
    renderer.onFrame(() => {
      needsUpdate.current = true;
    });

    // Kick off the initial draw-in animation
    renderer.startInitialDraw();

    return () => {
      renderer.destroy();
      texture.dispose();
    };
  }, [screenMesh]);

  // Propagate texture updates into the demand-mode frame loop
  useFrame(() => {
    if (needsUpdate.current && textureRef.current) {
      textureRef.current.needsUpdate = true;
      needsUpdate.current = false;
      invalidate();
    }
  });

  // --- Click: detect tab taps via raycasting + UV coords ---
  const handleClick = useCallback(
    (event: PointerEvent) => {
      if (!rendererRef.current) return;

      const rect = gl.domElement.getBoundingClientRect();
      pointer.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

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
            rendererRef.current.switchTab(tab.id);
            onTabChange?.(tab.id);
          }
        }
      }
    },
    [screenMesh, camera, gl.domElement, onTabChange],
  );

  // --- Hover: cursor = pointer over tab bar, grab elsewhere ---
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
          return;
        }
      }
      gl.domElement.style.cursor = 'grab';
    },
    [screenMesh, camera, gl.domElement],
  );

  // --- Leave: reset cursor to default (not 'grab') ---
  const handlePointerLeave = useCallback(() => {
    gl.domElement.style.cursor = 'default';
  }, [gl.domElement]);

  // Attach / detach event listeners on the canvas element
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [gl.domElement, handleClick, handlePointerMove, handlePointerLeave]);

  // Behaviour-only component — no visual output
  return null;
}
