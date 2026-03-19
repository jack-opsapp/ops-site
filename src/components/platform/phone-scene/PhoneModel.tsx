'use client';

/**
 * PhoneModel — Hybrid X-ray iPhone geometry.
 *
 * Semi-transparent glass body with visible internal structure,
 * subtle screen reflection, camera array on back, speaker grille,
 * charging port, and proper button geometry. Stylized but premium —
 * not photorealistic, not flat wireframe.
 *
 * iPhone 15 Pro proportions: 71.6mm x 146.6mm x 8.25mm → aspect ~1:2.05
 */

import { useMemo } from 'react';
import {
  Shape,
  ShapeGeometry,
  ExtrudeGeometry,
  Float32BufferAttribute,
  CylinderGeometry,
  RingGeometry,
  type Mesh,
} from 'three';
import { Edges, RoundedBox } from '@react-three/drei';

// --- Phone dimensions (3D units, proportions matter) ---
const PHONE_WIDTH = 2.0;
const PHONE_HEIGHT = PHONE_WIDTH * 2.05; // ~4.1
const PHONE_DEPTH = 0.22;
const CORNER_RADIUS = 0.2;

// Screen fills the face exactly
const SCREEN_WIDTH = PHONE_WIDTH;
const SCREEN_HEIGHT = PHONE_HEIGHT;

export { SCREEN_WIDTH, SCREEN_HEIGHT };

// --- Helpers ---
function roundedRectShape(w: number, h: number, r: number): Shape {
  const hw = w / 2;
  const hh = h / 2;
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
  return shape;
}

interface PhoneModelProps {
  screenRef?: React.Ref<Mesh>;
}

export default function PhoneModel({ screenRef }: PhoneModelProps) {
  // --- Screen geometry with corrected UVs ---
  const screenGeometry = useMemo(() => {
    const shape = roundedRectShape(SCREEN_WIDTH, SCREEN_HEIGHT, CORNER_RADIUS);
    const geo = new ShapeGeometry(shape);

    const hw = SCREEN_WIDTH / 2;
    const hh = SCREEN_HEIGHT / 2;
    const uvAttr = geo.attributes.uv;
    const uvArray = new Float32Array(uvAttr.count * 2);
    for (let i = 0; i < uvAttr.count; i++) {
      uvArray[i * 2] = (uvAttr.getX(i) + hw) / (hw * 2);
      uvArray[i * 2 + 1] = (uvAttr.getY(i) + hh) / (hh * 2);
    }
    geo.setAttribute('uv', new Float32BufferAttribute(uvArray, 2));
    return geo;
  }, []);

  // --- Frame lip (inner chamfer edge where screen meets body) ---
  const frameLipGeometry = useMemo(() => {
    const outer = roundedRectShape(PHONE_WIDTH, PHONE_HEIGHT, CORNER_RADIUS);
    const inner = roundedRectShape(
      PHONE_WIDTH - 0.06,
      PHONE_HEIGHT - 0.06,
      CORNER_RADIUS - 0.03,
    );
    outer.holes.push(inner);
    return new ExtrudeGeometry(outer, {
      depth: 0.02,
      bevelEnabled: false,
    });
  }, []);

  // --- Camera array (back, upper-left) ---
  const cameraLensGeo = useMemo(() => new CylinderGeometry(0.12, 0.12, 0.04, 24), []);
  const cameraRingGeo = useMemo(() => new RingGeometry(0.10, 0.14, 24), []);
  const cameraBumpGeo = useMemo(() => {
    const shape = roundedRectShape(0.65, 0.65, 0.12);
    return new ExtrudeGeometry(shape, { depth: 0.03, bevelEnabled: false });
  }, []);

  // --- Speaker grille (bottom edge) ---
  const speakerDotGeo = useMemo(() => new CylinderGeometry(0.015, 0.015, 0.01, 8), []);

  // --- Charging port (bottom edge, center) ---
  const portGeo = useMemo(() => {
    const shape = roundedRectShape(0.18, 0.06, 0.03);
    return new ShapeGeometry(shape);
  }, []);

  return (
    <group>
      {/* ====== PHONE BODY — Semi-transparent glass ====== */}
      <RoundedBox
        args={[PHONE_WIDTH, PHONE_HEIGHT, PHONE_DEPTH]}
        radius={CORNER_RADIUS}
        smoothness={4}
      >
        <meshPhysicalMaterial
          color="#111111"
          transparent
          opacity={0.6}
          roughness={0.15}
          metalness={0.1}
          clearcoat={0.8}
          clearcoatRoughness={0.1}
          envMapIntensity={0.5}
          side={2} // DoubleSide — see internal edges through the glass
        />
        <Edges
          threshold={15}
          color="#FFFFFF"
          lineWidth={1.8}
          opacity={0.35}
          transparent
        />
      </RoundedBox>

      {/* ====== FRAME LIP — Chamfered inner edge ====== */}
      <mesh
        geometry={frameLipGeometry}
        position={[0, 0, PHONE_DEPTH / 2 - 0.015]}
      >
        <meshPhysicalMaterial
          color="#1A1A1A"
          metalness={0.6}
          roughness={0.2}
          envMapIntensity={0.8}
        />
      </mesh>

      {/* ====== INTERNAL STRUCTURE — visible through glass ====== */}
      {/* Battery outline (center of phone interior) */}
      <RoundedBox
        args={[1.5, 2.6, 0.08]}
        radius={0.08}
        smoothness={2}
        position={[0, -0.2, 0]}
      >
        <meshBasicMaterial color="#171717" transparent opacity={0.4} />
        <Edges threshold={15} color="#FFFFFF" lineWidth={0.8} opacity={0.08} transparent />
      </RoundedBox>

      {/* Logic board (upper portion) */}
      <RoundedBox
        args={[1.6, 0.8, 0.04]}
        radius={0.04}
        smoothness={2}
        position={[0, 1.3, 0]}
      >
        <meshBasicMaterial color="#151515" transparent opacity={0.3} />
        <Edges threshold={15} color="#FFFFFF" lineWidth={0.6} opacity={0.06} transparent />
      </RoundedBox>

      {/* Taptic engine (bottom) */}
      <RoundedBox
        args={[1.0, 0.3, 0.06]}
        radius={0.04}
        smoothness={2}
        position={[0, -1.7, 0]}
      >
        <meshBasicMaterial color="#171717" transparent opacity={0.3} />
        <Edges threshold={15} color="#FFFFFF" lineWidth={0.6} opacity={0.06} transparent />
      </RoundedBox>

      {/* ====== SCREEN — Canvas texture target ====== */}
      <mesh
        ref={screenRef}
        position={[0, 0, PHONE_DEPTH / 2 + 0.002]}
      >
        <primitive object={screenGeometry} attach="geometry" />
        <meshBasicMaterial color="#0A0A0A" />
      </mesh>

      {/* Screen glass reflection overlay — faint specular sheen on top of texture */}
      <mesh position={[0, 0, PHONE_DEPTH / 2 + 0.003]}>
        <primitive object={screenGeometry.clone()} attach="geometry" />
        <meshPhysicalMaterial
          color="#000000"
          transparent
          opacity={0.08}
          roughness={0.05}
          metalness={0.0}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          envMapIntensity={1.2}
        />
      </mesh>

      {/* ====== DYNAMIC ISLAND (front, top center) ====== */}
      <mesh position={[0, SCREEN_HEIGHT / 2 - 0.22, PHONE_DEPTH / 2 + 0.004]}>
        <planeGeometry args={[0.45, 0.12]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.9} />
      </mesh>
      <RoundedBox
        args={[0.45, 0.12, 0.005]}
        radius={0.06}
        smoothness={2}
        position={[0, SCREEN_HEIGHT / 2 - 0.22, PHONE_DEPTH / 2 + 0.005]}
      >
        <meshBasicMaterial visible={false} />
        <Edges threshold={15} color="#FFFFFF" lineWidth={1.0} opacity={0.15} transparent />
      </RoundedBox>

      {/* ====== CAMERA ARRAY (back, upper-left) ====== */}
      <group position={[-0.42, 1.25, -PHONE_DEPTH / 2 - 0.001]}>
        {/* Camera bump housing */}
        <mesh geometry={cameraBumpGeo} rotation={[Math.PI, 0, 0]}>
          <meshPhysicalMaterial
            color="#0D0D0D"
            metalness={0.4}
            roughness={0.3}
            clearcoat={0.5}
            clearcoatRoughness={0.2}
            transparent
            opacity={0.7}
          />
        </mesh>
        <mesh geometry={cameraBumpGeo} rotation={[Math.PI, 0, 0]}>
          <meshBasicMaterial visible={false} />
          <Edges threshold={15} color="#FFFFFF" lineWidth={1.2} opacity={0.2} transparent />
        </mesh>

        {/* Main camera lens (upper-left of array) */}
        <group position={[-0.14, 0.14, -0.035]}>
          <mesh geometry={cameraLensGeo} rotation={[Math.PI / 2, 0, 0]}>
            <meshPhysicalMaterial
              color="#050510"
              metalness={0.8}
              roughness={0.1}
              clearcoat={1.0}
              clearcoatRoughness={0.05}
            />
          </mesh>
          <mesh geometry={cameraRingGeo} rotation={[0, 0, 0]} position={[0, 0, 0.02]}>
            <meshPhysicalMaterial color="#222222" metalness={0.9} roughness={0.15} />
          </mesh>
        </group>

        {/* Ultra-wide lens (upper-right) */}
        <group position={[0.14, 0.14, -0.035]}>
          <mesh geometry={cameraLensGeo} rotation={[Math.PI / 2, 0, 0]}>
            <meshPhysicalMaterial
              color="#050510"
              metalness={0.8}
              roughness={0.1}
              clearcoat={1.0}
              clearcoatRoughness={0.05}
            />
          </mesh>
          <mesh geometry={cameraRingGeo} position={[0, 0, 0.02]}>
            <meshPhysicalMaterial color="#222222" metalness={0.9} roughness={0.15} />
          </mesh>
        </group>

        {/* Telephoto lens (bottom-left) */}
        <group position={[-0.14, -0.14, -0.035]}>
          <mesh geometry={cameraLensGeo} rotation={[Math.PI / 2, 0, 0]}>
            <meshPhysicalMaterial
              color="#050510"
              metalness={0.8}
              roughness={0.1}
              clearcoat={1.0}
              clearcoatRoughness={0.05}
            />
          </mesh>
          <mesh geometry={cameraRingGeo} position={[0, 0, 0.02]}>
            <meshPhysicalMaterial color="#222222" metalness={0.9} roughness={0.15} />
          </mesh>
        </group>

        {/* LiDAR / Flash (bottom-right, smaller) */}
        <mesh position={[0.14, -0.14, -0.025]}>
          <cylinderGeometry args={[0.04, 0.04, 0.02, 12]} />
          <meshPhysicalMaterial
            color="#1A1520"
            metalness={0.5}
            roughness={0.2}
            clearcoat={0.8}
            clearcoatRoughness={0.1}
          />
        </mesh>
      </group>

      {/* ====== SIDE BUTTONS — Proper extruded geometry ====== */}
      {/* Volume buttons (left side) */}
      <group position={[-PHONE_WIDTH / 2, 0, 0]}>
        <RoundedBox args={[0.04, 0.28, 0.06]} radius={0.02} smoothness={2} position={[-0.02, 0.6, 0]}>
          <meshPhysicalMaterial color="#1A1A1A" metalness={0.7} roughness={0.25} />
          <Edges threshold={15} color="#FFFFFF" lineWidth={0.8} opacity={0.2} transparent />
        </RoundedBox>
        <RoundedBox args={[0.04, 0.28, 0.06]} radius={0.02} smoothness={2} position={[-0.02, 0.25, 0]}>
          <meshPhysicalMaterial color="#1A1A1A" metalness={0.7} roughness={0.25} />
          <Edges threshold={15} color="#FFFFFF" lineWidth={0.8} opacity={0.2} transparent />
        </RoundedBox>
        {/* Action button (above volume) */}
        <RoundedBox args={[0.04, 0.14, 0.06]} radius={0.02} smoothness={2} position={[-0.02, 0.95, 0]}>
          <meshPhysicalMaterial color="#1A1A1A" metalness={0.7} roughness={0.25} />
          <Edges threshold={15} color="#FFFFFF" lineWidth={0.8} opacity={0.2} transparent />
        </RoundedBox>
      </group>

      {/* Power button (right side) */}
      <RoundedBox
        args={[0.04, 0.38, 0.06]}
        radius={0.02}
        smoothness={2}
        position={[PHONE_WIDTH / 2 + 0.02, 0.5, 0]}
      >
        <meshPhysicalMaterial color="#1A1A1A" metalness={0.7} roughness={0.25} />
        <Edges threshold={15} color="#FFFFFF" lineWidth={0.8} opacity={0.2} transparent />
      </RoundedBox>

      {/* ====== BOTTOM EDGE — Speaker + Port ====== */}
      <group position={[0, -PHONE_HEIGHT / 2, 0]}>
        {/* Charging port (USB-C) */}
        <mesh
          geometry={portGeo}
          position={[0, 0, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshBasicMaterial color="#080808" />
        </mesh>
        <RoundedBox
          args={[0.2, 0.04, 0.08]}
          radius={0.02}
          smoothness={2}
          position={[0, -0.005, 0]}
        >
          <meshBasicMaterial visible={false} />
          <Edges threshold={15} color="#FFFFFF" lineWidth={0.8} opacity={0.15} transparent />
        </RoundedBox>

        {/* Speaker grille — left cluster */}
        {[-0.5, -0.46, -0.42, -0.38, -0.34, -0.30].map((x) => (
          <mesh
            key={`spkL${x}`}
            geometry={speakerDotGeo}
            position={[x, -0.005, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <meshBasicMaterial color="#0A0A0A" transparent opacity={0.6} />
          </mesh>
        ))}

        {/* Speaker grille — right cluster */}
        {[0.30, 0.34, 0.38, 0.42, 0.46, 0.50].map((x) => (
          <mesh
            key={`spkR${x}`}
            geometry={speakerDotGeo}
            position={[x, -0.005, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <meshBasicMaterial color="#0A0A0A" transparent opacity={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
