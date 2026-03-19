'use client';

/**
 * PhoneModel — 3D wireframe iPhone geometry.
 *
 * The phone body is rendered as edge lines (EdgesGeometry on a RoundedBox).
 * The screen is a separate PlaneGeometry for texture mapping.
 * The Dynamic Island is a small shape at the top center.
 *
 * iPhone 15 Pro proportions: 71.6mm x 146.6mm x 8.25mm → aspect ~1:2.05
 */

import { useRef, useMemo } from 'react';
import { EdgesGeometry, type Mesh } from 'three';
import { RoundedBoxGeometry } from 'three-stdlib';

// Phone dimensions in 3D units (arbitrary scale, proportions matter)
const PHONE_WIDTH = 2.0;
const PHONE_HEIGHT = PHONE_WIDTH * 2.05; // iPhone 15 Pro aspect
const PHONE_DEPTH = 0.22;
const CORNER_RADIUS = 0.2;
const BEZEL = 0.08; // Bezel width between phone edge and screen

// Screen dimensions (inset from phone body)
const SCREEN_WIDTH = PHONE_WIDTH - BEZEL * 2;
const SCREEN_HEIGHT = PHONE_HEIGHT - BEZEL * 2;

export { SCREEN_WIDTH, SCREEN_HEIGHT };

interface PhoneModelProps {
  /** Ref to the screen plane mesh (for raycasting and texture mapping) */
  screenRef?: React.RefObject<Mesh | null>;
}

export default function PhoneModel({ screenRef }: PhoneModelProps) {
  const bodyRef = useRef<Mesh>(null);

  // Create phone body edges geometry (memoized — expensive operation)
  const edgesGeometry = useMemo(() => {
    const boxGeometry = new RoundedBoxGeometry(
      PHONE_WIDTH,
      PHONE_HEIGHT,
      PHONE_DEPTH,
      4,           // segments per side
      CORNER_RADIUS,
    );
    return new EdgesGeometry(boxGeometry, 15); // threshold angle for visible edges
  }, []);

  // Dynamic Island shape (small rounded rectangle at top of screen)
  const dynamicIslandGeometry = useMemo(() => {
    const islandW = 0.45;
    const islandH = 0.12;
    const islandGeo = new RoundedBoxGeometry(islandW, islandH, 0.01, 2, 0.06);
    return new EdgesGeometry(islandGeo, 15);
  }, []);

  return (
    <group>
      {/* Phone body — wireframe edges */}
      <lineSegments ref={bodyRef} geometry={edgesGeometry}>
        <lineBasicMaterial color="#FFFFFF" transparent opacity={0.18} />
      </lineSegments>

      {/* Screen plane — sits slightly in front of the phone face */}
      <mesh
        ref={screenRef}
        position={[0, 0, PHONE_DEPTH / 2 + 0.001]}
      >
        <planeGeometry args={[SCREEN_WIDTH, SCREEN_HEIGHT]} />
        {/* Default material — will be replaced with CanvasTexture in Sprint 3 */}
        <meshBasicMaterial color="#0A0A0A" />
      </mesh>

      {/* Dynamic Island */}
      <lineSegments
        geometry={dynamicIslandGeometry}
        position={[0, SCREEN_HEIGHT / 2 - 0.15, PHONE_DEPTH / 2 + 0.002]}
      >
        <lineBasicMaterial color="#FFFFFF" transparent opacity={0.12} />
      </lineSegments>

      {/* Volume buttons on the left side (correct iPhone layout) */}
      <group position={[-PHONE_WIDTH / 2 - 0.001, 0, 0]}>
        {/* Volume up */}
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[0.01, 0.25, 0.05]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.08} />
        </mesh>
        {/* Volume down */}
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[0.01, 0.25, 0.05]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.08} />
        </mesh>
      </group>

      {/* Power button on the right side (correct iPhone layout) */}
      <mesh position={[PHONE_WIDTH / 2 + 0.001, 0.5, 0]}>
        <boxGeometry args={[0.01, 0.35, 0.05]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.08} />
      </mesh>
    </group>
  );
}
