'use client';

/**
 * PhoneModel — iPhone 16 Pro geometry (Black Titanium).
 *
 * Accurate construction based on teardown research:
 * - Titanium frame (matte, aerospace-grade)
 * - Matte glass back (opaque, color-infused via nanocrystalline etching)
 * - Edge-to-edge OLED display with Dynamic Island
 * - 3-lens camera array in triangular layout with polished housing ring
 * - Action button, separate vol up/down (left), power button (right)
 * - USB-C port + speaker grilles (bottom), microphone (top)
 *
 * Proportions: 71.5mm × 149.6mm × 8.25mm → aspect ~1:2.09
 * Camera bump protrusion: 3.9mm
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

// --- Dimensions (3D units, proportional to real phone) ---
const PHONE_WIDTH = 2.0;
const PHONE_HEIGHT = PHONE_WIDTH * 2.09; // 71.5:149.6
const PHONE_DEPTH = 0.23; // 8.25mm proportional
const CORNER_RADIUS = 0.2;
const FRAME_THICKNESS = 0.06; // Titanium band width

// Camera bump
const BUMP_PROTRUSION = 0.11; // 3.9mm proportional
const BUMP_SIZE = 0.72; // Square housing with rounded corners

// Screen fills the face
const SCREEN_WIDTH = PHONE_WIDTH;
const SCREEN_HEIGHT = PHONE_HEIGHT;

export { SCREEN_WIDTH, SCREEN_HEIGHT };

// --- Colors: Black Titanium ---
const TITANIUM_COLOR = '#1A1A1A';
const BACK_GLASS_COLOR = '#111111';
const CAMERA_HOUSING_COLOR = '#0A0A0A';
const LENS_COLOR = '#050510';
const POLISHED_RING_COLOR = '#2A2A2A';

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

  // --- Frame lip (chamfered edge where screen meets titanium band) ---
  const frameLipGeometry = useMemo(() => {
    const outer = roundedRectShape(PHONE_WIDTH, PHONE_HEIGHT, CORNER_RADIUS);
    const inner = roundedRectShape(
      PHONE_WIDTH - FRAME_THICKNESS,
      PHONE_HEIGHT - FRAME_THICKNESS,
      CORNER_RADIUS - FRAME_THICKNESS / 2,
    );
    outer.holes.push(inner);
    return new ExtrudeGeometry(outer, { depth: 0.015, bevelEnabled: false });
  }, []);

  // --- Camera geometries ---
  const lensGeo = useMemo(() => new CylinderGeometry(0.13, 0.13, 0.05, 32), []);
  const lensRingGeo = useMemo(() => new RingGeometry(0.11, 0.155, 32), []);
  const smallLensGeo = useMemo(() => new CylinderGeometry(0.045, 0.045, 0.03, 16), []);
  const bumpGeo = useMemo(() => {
    const shape = roundedRectShape(BUMP_SIZE, BUMP_SIZE, 0.14);
    return new ExtrudeGeometry(shape, { depth: BUMP_PROTRUSION, bevelEnabled: false });
  }, []);

  // --- Speaker dot ---
  const speakerDotGeo = useMemo(() => new CylinderGeometry(0.016, 0.016, 0.01, 8), []);

  // --- USB-C port shape ---
  const portGeo = useMemo(() => new ShapeGeometry(roundedRectShape(0.18, 0.055, 0.027)), []);

  return (
    <group>
      {/* ====== PHONE BODY — Titanium frame + opaque fill ====== */}
      {/* The main body is the titanium frame — opaque, matte metallic */}
      <RoundedBox
        args={[PHONE_WIDTH, PHONE_HEIGHT, PHONE_DEPTH]}
        radius={CORNER_RADIUS}
        smoothness={4}
      >
        <meshPhysicalMaterial
          color={TITANIUM_COLOR}
          metalness={0.65}
          roughness={0.55}
          clearcoat={0.15}
          clearcoatRoughness={0.6}
          envMapIntensity={0.4}
        />
        {/* Subtle edge highlight — very faint, just catches light */}
        <Edges
          threshold={15}
          color="#FFFFFF"
          lineWidth={1.2}
          opacity={0.12}
          transparent
        />
      </RoundedBox>

      {/* ====== BACK GLASS PANEL — Matte, opaque, color-infused ====== */}
      {/* Sits flush against the back face of the titanium frame */}
      <mesh position={[0, 0, -PHONE_DEPTH / 2 - 0.001]}>
        <primitive object={new ShapeGeometry(roundedRectShape(
          PHONE_WIDTH - FRAME_THICKNESS,
          PHONE_HEIGHT - FRAME_THICKNESS,
          CORNER_RADIUS - FRAME_THICKNESS / 2,
        ))} attach="geometry" />
        <meshPhysicalMaterial
          color={BACK_GLASS_COLOR}
          metalness={0.05}
          roughness={0.7}
          clearcoat={0.3}
          clearcoatRoughness={0.4}
          envMapIntensity={0.3}
        />
      </mesh>

      {/* ====== FRONT FRAME LIP — Chamfered inner edge ====== */}
      <mesh
        geometry={frameLipGeometry}
        position={[0, 0, PHONE_DEPTH / 2 - 0.01]}
      >
        <meshPhysicalMaterial
          color={TITANIUM_COLOR}
          metalness={0.7}
          roughness={0.3}
          envMapIntensity={0.6}
        />
      </mesh>

      {/* ====== SCREEN — Canvas texture target ====== */}
      <mesh
        ref={screenRef}
        position={[0, 0, PHONE_DEPTH / 2 + 0.002]}
      >
        <primitive object={screenGeometry} attach="geometry" />
        <meshBasicMaterial color="#0A0A0A" />
      </mesh>

      {/* Screen glass — faint reflection layer over the display */}
      <mesh position={[0, 0, PHONE_DEPTH / 2 + 0.003]}>
        <primitive object={screenGeometry.clone()} attach="geometry" />
        <meshPhysicalMaterial
          color="#000000"
          transparent
          opacity={0.06}
          roughness={0.05}
          metalness={0.0}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          envMapIntensity={1.0}
        />
      </mesh>

      {/* ====== DYNAMIC ISLAND ====== */}
      <RoundedBox
        args={[0.42, 0.11, 0.006]}
        radius={0.055}
        smoothness={3}
        position={[0, SCREEN_HEIGHT / 2 - 0.22, PHONE_DEPTH / 2 + 0.004]}
      >
        <meshBasicMaterial color="#000000" />
        <Edges threshold={15} color="#333333" lineWidth={0.6} opacity={0.3} transparent />
      </RoundedBox>

      {/* ====== CAMERA ARRAY — Triangular layout, polished housing ====== */}
      <group position={[-0.38, 1.3, -PHONE_DEPTH / 2 - 0.001]}>
        {/* Camera bump housing — polished finish (distinct from matte back) */}
        <mesh geometry={bumpGeo} rotation={[Math.PI, 0, 0]}>
          <meshPhysicalMaterial
            color={CAMERA_HOUSING_COLOR}
            metalness={0.3}
            roughness={0.15}
            clearcoat={0.8}
            clearcoatRoughness={0.08}
            envMapIntensity={0.7}
          />
        </mesh>
        {/* Housing edge outline */}
        <mesh geometry={bumpGeo} rotation={[Math.PI, 0, 0]}>
          <meshBasicMaterial visible={false} />
          <Edges threshold={15} color="#FFFFFF" lineWidth={1.0} opacity={0.1} transparent />
        </mesh>

        {/* Main/Fusion camera — lower-left of array */}
        <group position={[-0.14, -0.14, -BUMP_PROTRUSION - 0.01]}>
          <mesh geometry={lensGeo} rotation={[Math.PI / 2, 0, 0]}>
            <meshPhysicalMaterial
              color={LENS_COLOR}
              metalness={0.9}
              roughness={0.05}
              clearcoat={1.0}
              clearcoatRoughness={0.02}
              envMapIntensity={1.5}
            />
          </mesh>
          {/* Polished metallic ring */}
          <mesh geometry={lensRingGeo} position={[0, 0, 0.025]}>
            <meshPhysicalMaterial
              color={POLISHED_RING_COLOR}
              metalness={0.95}
              roughness={0.08}
              envMapIntensity={1.2}
            />
          </mesh>
        </group>

        {/* Ultra-wide camera — upper-left */}
        <group position={[-0.14, 0.14, -BUMP_PROTRUSION - 0.01]}>
          <mesh geometry={lensGeo} rotation={[Math.PI / 2, 0, 0]}>
            <meshPhysicalMaterial
              color={LENS_COLOR}
              metalness={0.9}
              roughness={0.05}
              clearcoat={1.0}
              clearcoatRoughness={0.02}
              envMapIntensity={1.5}
            />
          </mesh>
          <mesh geometry={lensRingGeo} position={[0, 0, 0.025]}>
            <meshPhysicalMaterial
              color={POLISHED_RING_COLOR}
              metalness={0.95}
              roughness={0.08}
              envMapIntensity={1.2}
            />
          </mesh>
        </group>

        {/* Telephoto camera — right side (triangular offset) */}
        <group position={[0.14, 0.0, -BUMP_PROTRUSION - 0.01]}>
          <mesh geometry={lensGeo} rotation={[Math.PI / 2, 0, 0]}>
            <meshPhysicalMaterial
              color={LENS_COLOR}
              metalness={0.9}
              roughness={0.05}
              clearcoat={1.0}
              clearcoatRoughness={0.02}
              envMapIntensity={1.5}
            />
          </mesh>
          <mesh geometry={lensRingGeo} position={[0, 0, 0.025]}>
            <meshPhysicalMaterial
              color={POLISHED_RING_COLOR}
              metalness={0.95}
              roughness={0.08}
              envMapIntensity={1.2}
            />
          </mesh>
        </group>

        {/* LiDAR scanner — small, between lenses */}
        <mesh position={[0.14, -0.14, -BUMP_PROTRUSION - 0.005]}>
          <mesh geometry={smallLensGeo} rotation={[Math.PI / 2, 0, 0]}>
            <meshPhysicalMaterial
              color="#15101A"
              metalness={0.6}
              roughness={0.15}
              clearcoat={0.6}
              clearcoatRoughness={0.1}
            />
          </mesh>
        </mesh>

        {/* Flash — small circle */}
        <mesh position={[-0.14, 0.0, -BUMP_PROTRUSION - 0.003]}>
          <cylinderGeometry args={[0.035, 0.035, 0.01, 16]} />
          <meshPhysicalMaterial
            color="#F5F0E0"
            metalness={0.0}
            roughness={0.3}
            transparent
            opacity={0.7}
            envMapIntensity={0.3}
          />
        </mesh>

        {/* Microphone hole (tiny, near flash) */}
        <mesh position={[0.0, 0.22, -BUMP_PROTRUSION - 0.002]}>
          <cylinderGeometry args={[0.012, 0.012, 0.005, 8]} />
          <meshBasicMaterial color="#050505" />
        </mesh>
      </group>

      {/* ====== SIDE BUTTONS — Titanium, matte ====== */}
      {/* LEFT SIDE: Action button + Volume up + Volume down */}
      <group position={[-PHONE_WIDTH / 2, 0, 0]}>
        {/* Action button (highest, smaller) */}
        <RoundedBox
          args={[0.045, 0.15, 0.065]}
          radius={0.02}
          smoothness={2}
          position={[-0.022, 0.95, 0]}
        >
          <meshPhysicalMaterial color={TITANIUM_COLOR} metalness={0.7} roughness={0.45} envMapIntensity={0.5} />
          <Edges threshold={15} color="#FFFFFF" lineWidth={0.7} opacity={0.12} transparent />
        </RoundedBox>

        {/* Volume up */}
        <RoundedBox
          args={[0.045, 0.28, 0.065]}
          radius={0.02}
          smoothness={2}
          position={[-0.022, 0.58, 0]}
        >
          <meshPhysicalMaterial color={TITANIUM_COLOR} metalness={0.7} roughness={0.45} envMapIntensity={0.5} />
          <Edges threshold={15} color="#FFFFFF" lineWidth={0.7} opacity={0.12} transparent />
        </RoundedBox>

        {/* Volume down */}
        <RoundedBox
          args={[0.045, 0.28, 0.065]}
          radius={0.02}
          smoothness={2}
          position={[-0.022, 0.24, 0]}
        >
          <meshPhysicalMaterial color={TITANIUM_COLOR} metalness={0.7} roughness={0.45} envMapIntensity={0.5} />
          <Edges threshold={15} color="#FFFFFF" lineWidth={0.7} opacity={0.12} transparent />
        </RoundedBox>
      </group>

      {/* RIGHT SIDE: Power/Side button */}
      <RoundedBox
        args={[0.045, 0.38, 0.065]}
        radius={0.02}
        smoothness={2}
        position={[PHONE_WIDTH / 2 + 0.022, 0.55, 0]}
      >
        <meshPhysicalMaterial color={TITANIUM_COLOR} metalness={0.7} roughness={0.45} envMapIntensity={0.5} />
        <Edges threshold={15} color="#FFFFFF" lineWidth={0.7} opacity={0.12} transparent />
      </RoundedBox>

      {/* ====== BOTTOM EDGE ====== */}
      <group position={[0, -PHONE_HEIGHT / 2, 0]}>
        {/* USB-C port */}
        <mesh
          geometry={portGeo}
          position={[0, -0.003, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshBasicMaterial color="#060606" />
        </mesh>
        {/* Port edge outline */}
        <RoundedBox
          args={[0.20, 0.04, 0.075]}
          radius={0.02}
          smoothness={2}
          position={[0, -0.006, 0]}
        >
          <meshBasicMaterial visible={false} />
          <Edges threshold={15} color="#FFFFFF" lineWidth={0.6} opacity={0.1} transparent />
        </RoundedBox>

        {/* Speaker grille — left cluster */}
        {[-0.48, -0.44, -0.40, -0.36, -0.32, -0.28].map((x) => (
          <mesh
            key={`spkL${x}`}
            geometry={speakerDotGeo}
            position={[x, -0.006, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <meshBasicMaterial color="#060606" />
          </mesh>
        ))}

        {/* Speaker grille — right cluster */}
        {[0.28, 0.32, 0.36, 0.40, 0.44, 0.48].map((x) => (
          <mesh
            key={`spkR${x}`}
            geometry={speakerDotGeo}
            position={[x, -0.006, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <meshBasicMaterial color="#060606" />
          </mesh>
        ))}
      </group>

      {/* ====== TOP EDGE — Microphone hole ====== */}
      <mesh position={[0, PHONE_HEIGHT / 2 + 0.003, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.005, 8]} />
        <meshBasicMaterial color="#060606" />
      </mesh>
    </group>
  );
}
