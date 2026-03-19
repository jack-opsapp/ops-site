'use client';

/**
 * PhoneModel — 3D wireframe iPhone geometry.
 *
 * Uses drei's <Edges> component for visible thick lines (LineMaterial).
 * Standard WebGL lineSegments are capped at 1px on most GPUs — invisible
 * on dark backgrounds. <Edges> uses a shader-based line renderer that
 * supports real lineWidth.
 *
 * iPhone 15 Pro proportions: 71.6mm x 146.6mm x 8.25mm → aspect ~1:2.05
 */

import { useMemo } from 'react';
import { Shape, ShapeGeometry, Float32BufferAttribute, type Mesh } from 'three';
import { Edges, RoundedBox } from '@react-three/drei';

// Phone dimensions in 3D units (arbitrary scale, proportions matter)
const PHONE_WIDTH = 2.0;
const PHONE_HEIGHT = PHONE_WIDTH * 2.05; // iPhone 15 Pro aspect
const PHONE_DEPTH = 0.22;
const CORNER_RADIUS = 0.2;
// Screen dimensions — edge-to-edge, matching phone body exactly
const SCREEN_WIDTH = PHONE_WIDTH;
const SCREEN_HEIGHT = PHONE_HEIGHT;

export { SCREEN_WIDTH, SCREEN_HEIGHT };

interface PhoneModelProps {
  /** Ref to the screen plane mesh — accepts callback refs (for Suspense safety) */
  screenRef?: React.Ref<Mesh>;
}

export default function PhoneModel({ screenRef }: PhoneModelProps) {
  // Rounded rectangle screen geometry — matches the phone body's corner radius
  const screenGeometry = useMemo(() => {
    const hw = SCREEN_WIDTH / 2;
    const hh = SCREEN_HEIGHT / 2;
    const r = CORNER_RADIUS;
    const shape = new Shape();
    shape.moveTo(-hw + r, -hh);
    shape.lineTo(hw - r, -hh);
    shape.quadraticCurveTo(hw, -hh, hw, -hh + r);
    shape.lineTo(hw, hh - r);
    shape.quadraticCurveTo(hw, hh, hw - r, hh);
    shape.lineTo(-hw + r, hh);
    shape.quadraticCurveTo(-hw, hh, -hw, hh - r);
    shape.lineTo(-hw, -hh + r);
    shape.quadraticCurveTo(-hw, -hh, -hw + r, -hh);
    const geo = new ShapeGeometry(shape);

    // Fix UVs: ShapeGeometry generates UVs from raw shape coords (e.g. -0.92 to 0.92).
    // We need normalized 0-1 UVs for the CanvasTexture to map correctly.
    const uvAttr = geo.attributes.uv;
    const uvArray = new Float32Array(uvAttr.count * 2);
    for (let i = 0; i < uvAttr.count; i++) {
      const x = uvAttr.getX(i);
      const y = uvAttr.getY(i);
      uvArray[i * 2] = (x + hw) / (hw * 2);
      uvArray[i * 2 + 1] = (y + hh) / (hh * 2);
    }
    geo.setAttribute('uv', new Float32BufferAttribute(uvArray, 2));

    return geo;
  }, []);

  return (
    <group>
      {/* Phone body — drei <Edges> uses LineMaterial for real thick lines.
          lineWidth is in pixels and actually works (unlike lineBasicMaterial). */}
      <RoundedBox
        args={[PHONE_WIDTH, PHONE_HEIGHT, PHONE_DEPTH]}
        radius={CORNER_RADIUS}
        smoothness={4}
      >
        {/* Semi-transparent dark fill — gives the phone visual solidity.
            Without this the wireframe is hollow and you see through the sides. */}
        <meshBasicMaterial color="#0A0A0A" transparent opacity={0.85} />
        <Edges
          threshold={15}
          color="#FFFFFF"
          lineWidth={1.5}
          opacity={0.5}
          transparent
        />
      </RoundedBox>

      {/* Screen plane — sits slightly in front of the phone face */}
      <mesh
        ref={screenRef}
        position={[0, 0, PHONE_DEPTH / 2 + 0.001]}
      >
        <primitive object={screenGeometry} attach="geometry" />
        <meshBasicMaterial color="#0A0A0A" />
      </mesh>

      {/* Volume buttons on the left side (correct iPhone layout) */}
      <group position={[-PHONE_WIDTH / 2 - 0.001, 0, 0]}>
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[0.01, 0.25, 0.05]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.25} />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[0.01, 0.25, 0.05]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.25} />
        </mesh>
      </group>

      {/* Power button on the right side (correct iPhone layout) */}
      <mesh position={[PHONE_WIDTH / 2 + 0.001, 0.5, 0]}>
        <boxGeometry args={[0.01, 0.35, 0.05]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.25} />
      </mesh>
    </group>
  );
}
