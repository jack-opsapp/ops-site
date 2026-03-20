'use client';

/**
 * PhoneModel — iPhone 16 Pro (Black Titanium), accurate construction.
 *
 * Real dimensions: 71.5mm × 149.6mm × 8.25mm
 * All 3D values derived proportionally from PHONE_WIDTH = 2.0 as base unit.
 * Scale factor: 2.0 / 71.5 = 0.02797 units per mm
 *
 * Construction layers (matches real phone cross-section):
 * 1. Titanium frame band — flat sides, extruded rounded-rect ring
 * 2. Front glass panel — inset from frame by bezel width (1.2mm)
 * 3. Back glass panel — inset from frame, matte finish
 * 4. Screen (canvas texture) — on top of front glass
 * 5. Buttons — flush-mounted on frame band
 * 6. Camera array — protruding from back glass
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

// ============================================================
// DIMENSIONS — All derived from real iPhone 16 Pro measurements
// Base: PHONE_WIDTH = 2.0 units = 71.5mm real
// Scale: 1mm = 0.02797 units
// ============================================================
const SCALE = 2.0 / 71.5; // units per mm

const PHONE_WIDTH = 71.5 * SCALE;   // 2.0
const PHONE_HEIGHT = 149.6 * SCALE; // 4.184
const PHONE_DEPTH = 8.25 * SCALE;   // 0.2308

// Frame corner radius — iPhone 16 Pro has ~5.5mm radius
const CORNER_RADIUS = 5.5 * SCALE; // 0.1538

// Bezel — 1.2mm between screen edge and frame
const BEZEL = 1.2 * SCALE; // 0.0336

// Screen dimensions (inset by bezel on all sides)
const SCREEN_WIDTH = PHONE_WIDTH - BEZEL * 2;   // ~1.933
const SCREEN_HEIGHT = PHONE_HEIGHT - BEZEL * 2; // ~4.117
const SCREEN_CORNER_RADIUS = CORNER_RADIUS - BEZEL; // ~0.120

// Frame band thickness (titanium side wall) — ~2.8mm
const FRAME_BAND = 2.8 * SCALE; // 0.0783

// Camera bump
const BUMP_PROTRUSION = 4.0 * SCALE;  // 0.112
const BUMP_SIZE = 25.0 * SCALE;       // 0.699 (square housing ~25mm)
const BUMP_CORNER_RADIUS = 5.0 * SCALE; // 0.140

// Lens sizes
const LENS_RADIUS = 4.5 * SCALE;      // 0.126
const LENS_RING_INNER = 4.0 * SCALE;  // 0.112
const LENS_RING_OUTER = 5.5 * SCALE;  // 0.154
const LENS_SPACING = 10.0 * SCALE;    // 0.280

// Button dimensions
const BTN_PROTRUDE = 0.5 * SCALE;     // 0.014
const BTN_DEPTH = 2.5 * SCALE;        // 0.070
const ACTION_BTN_H = 5.0 * SCALE;     // 0.140
const VOL_BTN_H = 10.0 * SCALE;       // 0.280
const POWER_BTN_H = 13.0 * SCALE;     // 0.364
const CAM_CTRL_BTN_H = 7.0 * SCALE;   // 0.196

export { SCREEN_WIDTH, SCREEN_HEIGHT };

// --- Colors: Black Titanium ---
const TITANIUM = '#1C1C1E';
const BACK_GLASS = '#121214';
const FRONT_GLASS = '#0A0A0A';
const CAMERA_HOUSING = '#0E0E10';
const LENS_DARK = '#050508';
const RING_POLISH = '#303032';

// --- Helpers ---
function rrShape(w: number, h: number, r: number): Shape {
  const hw = w / 2;
  const hh = h / 2;
  const cr = Math.min(r, hw, hh);
  const shape = new Shape();
  shape.moveTo(-hw + cr, -hh);
  shape.lineTo(hw - cr, -hh);
  shape.quadraticCurveTo(hw, -hh, hw, -hh + cr);
  shape.lineTo(hw, hh - cr);
  shape.quadraticCurveTo(hw, hh, hw - cr, hh);
  shape.lineTo(-hw + cr, hh);
  shape.quadraticCurveTo(-hw, hh, -hw, hh - cr);
  shape.lineTo(-hw, -hh + cr);
  shape.quadraticCurveTo(-hw, -hh, -hw + cr, -hh);
  return shape;
}

interface PhoneModelProps {
  screenRef?: React.Ref<Mesh>;
}

export default function PhoneModel({ screenRef }: PhoneModelProps) {
  // --- Screen geometry with corrected UVs ---
  const screenGeo = useMemo(() => {
    const shape = rrShape(SCREEN_WIDTH, SCREEN_HEIGHT, SCREEN_CORNER_RADIUS);
    const geo = new ShapeGeometry(shape);
    const hw = SCREEN_WIDTH / 2;
    const hh = SCREEN_HEIGHT / 2;
    const uvAttr = geo.attributes.uv;
    const arr = new Float32Array(uvAttr.count * 2);
    for (let i = 0; i < uvAttr.count; i++) {
      arr[i * 2] = (uvAttr.getX(i) + hw) / (hw * 2);
      arr[i * 2 + 1] = (uvAttr.getY(i) + hh) / (hh * 2);
    }
    geo.setAttribute('uv', new Float32BufferAttribute(arr, 2));
    return geo;
  }, []);

  // --- Titanium frame band — extruded ring (outer - inner hole) ---
  const frameBandGeo = useMemo(() => {
    const outer = rrShape(PHONE_WIDTH, PHONE_HEIGHT, CORNER_RADIUS);
    const inner = rrShape(
      PHONE_WIDTH - FRAME_BAND * 2,
      PHONE_HEIGHT - FRAME_BAND * 2,
      CORNER_RADIUS - FRAME_BAND,
    );
    outer.holes.push(inner);
    return new ExtrudeGeometry(outer, { depth: PHONE_DEPTH, bevelEnabled: false });
  }, []);

  // --- Front/back glass panels ---
  const glassInsetW = PHONE_WIDTH - FRAME_BAND * 2;
  const glassInsetH = PHONE_HEIGHT - FRAME_BAND * 2;
  const glassCornerR = CORNER_RADIUS - FRAME_BAND;

  const frontGlassGeo = useMemo(
    () => new ShapeGeometry(rrShape(glassInsetW, glassInsetH, glassCornerR)),
    [],
  );
  const backGlassGeo = useMemo(
    () => new ShapeGeometry(rrShape(glassInsetW, glassInsetH, glassCornerR)),
    [],
  );

  // --- Camera geometries ---
  const lensGeo = useMemo(() => new CylinderGeometry(LENS_RADIUS, LENS_RADIUS, 0.04, 32), []);
  const ringGeo = useMemo(() => new RingGeometry(LENS_RING_INNER, LENS_RING_OUTER, 32), []);
  const smallLensGeo = useMemo(() => new CylinderGeometry(1.5 * SCALE, 1.5 * SCALE, 0.02, 16), []);
  const bumpGeo = useMemo(() => {
    const shape = rrShape(BUMP_SIZE, BUMP_SIZE, BUMP_CORNER_RADIUS);
    return new ExtrudeGeometry(shape, { depth: BUMP_PROTRUSION, bevelEnabled: false });
  }, []);

  // --- Bottom details ---
  const speakerDotGeo = useMemo(() => new CylinderGeometry(0.5 * SCALE, 0.5 * SCALE, 0.3 * SCALE, 8), []);
  const portGeo = useMemo(() => new ShapeGeometry(rrShape(6.5 * SCALE, 2.0 * SCALE, 1.0 * SCALE)), []);

  // --- Titanium material (shared props) ---
  const titaniumProps = {
    color: TITANIUM,
    metalness: 0.7,
    roughness: 0.5,
    clearcoat: 0.12,
    clearcoatRoughness: 0.6,
    envMapIntensity: 0.45,
  } as const;

  return (
    <group>
      {/* ====== TITANIUM FRAME BAND ======
          Extruded ring that forms the flat sides of the phone.
          Centered on Z so it spans -depth/2 to +depth/2. */}
      <mesh geometry={frameBandGeo} position={[0, 0, -PHONE_DEPTH / 2]}>
        <meshPhysicalMaterial {...titaniumProps} />
      </mesh>
      {/* Frame edge lines — subtle highlight on the flat titanium sides */}
      <mesh geometry={frameBandGeo} position={[0, 0, -PHONE_DEPTH / 2]}>
        <meshBasicMaterial visible={false} />
        <Edges threshold={12} color="#FFFFFF" lineWidth={1.0} opacity={0.1} transparent />
      </mesh>

      {/* ====== FRONT GLASS PANEL ======
          Sits inside the frame on the front face. */}
      <mesh geometry={frontGlassGeo} position={[0, 0, PHONE_DEPTH / 2 - 0.001]}>
        <meshPhysicalMaterial
          color={FRONT_GLASS}
          metalness={0.0}
          roughness={0.1}
          clearcoat={0.8}
          clearcoatRoughness={0.08}
          envMapIntensity={0.6}
        />
      </mesh>

      {/* ====== BACK GLASS PANEL ======
          Matte glass, opaque, color-infused. */}
      <mesh geometry={backGlassGeo} position={[0, 0, -PHONE_DEPTH / 2 + 0.001]} rotation={[0, Math.PI, 0]}>
        <meshPhysicalMaterial
          color={BACK_GLASS}
          metalness={0.05}
          roughness={0.65}
          clearcoat={0.25}
          clearcoatRoughness={0.4}
          envMapIntensity={0.3}
        />
      </mesh>

      {/* ====== SCREEN (Canvas texture target) ====== */}
      <mesh ref={screenRef} position={[0, 0, PHONE_DEPTH / 2 + 0.001]}>
        <primitive object={screenGeo} attach="geometry" />
        <meshBasicMaterial color="#0A0A0A" />
      </mesh>

      {/* Screen glass reflection overlay */}
      <mesh position={[0, 0, PHONE_DEPTH / 2 + 0.002]}>
        <primitive object={screenGeo.clone()} attach="geometry" />
        <meshPhysicalMaterial
          color="#000000"
          transparent
          opacity={0.05}
          roughness={0.05}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          envMapIntensity={0.8}
        />
      </mesh>

      {/* ====== DYNAMIC ISLAND ====== */}
      <RoundedBox
        args={[15.0 * SCALE, 4.0 * SCALE, 0.3 * SCALE]}
        radius={2.0 * SCALE}
        smoothness={3}
        position={[0, SCREEN_HEIGHT / 2 - 6.0 * SCALE, PHONE_DEPTH / 2 + 0.003]}
      >
        <meshBasicMaterial color="#000000" />
      </RoundedBox>

      {/* ====== CAMERA ARRAY ====== */}
      <group position={[-13.5 * SCALE, (PHONE_HEIGHT / 2) - 14.0 * SCALE, -PHONE_DEPTH / 2]}>
        {/* Camera bump housing */}
        <mesh geometry={bumpGeo} rotation={[Math.PI, 0, 0]}>
          <meshPhysicalMaterial
            color={CAMERA_HOUSING}
            metalness={0.25}
            roughness={0.12}
            clearcoat={0.85}
            clearcoatRoughness={0.06}
            envMapIntensity={0.7}
          />
        </mesh>
        <mesh geometry={bumpGeo} rotation={[Math.PI, 0, 0]}>
          <meshBasicMaterial visible={false} />
          <Edges threshold={15} color="#FFFFFF" lineWidth={0.8} opacity={0.08} transparent />
        </mesh>

        {/* Lens helper — renders a lens + ring at given position */}
        {/* Main/Fusion — lower-left */}
        {renderLens(-LENS_SPACING / 2, -LENS_SPACING / 2, lensGeo, ringGeo, BUMP_PROTRUSION)}
        {/* Ultra-wide — upper-left */}
        {renderLens(-LENS_SPACING / 2, LENS_SPACING / 2, lensGeo, ringGeo, BUMP_PROTRUSION)}
        {/* Telephoto — right center (triangular) */}
        {renderLens(LENS_SPACING / 2, 0, lensGeo, ringGeo, BUMP_PROTRUSION)}

        {/* LiDAR — bottom-right */}
        <mesh position={[LENS_SPACING / 2, -LENS_SPACING / 2, -BUMP_PROTRUSION - 0.003]}>
          <mesh geometry={smallLensGeo} rotation={[Math.PI / 2, 0, 0]}>
            <meshPhysicalMaterial color="#12101A" metalness={0.6} roughness={0.15} clearcoat={0.5} clearcoatRoughness={0.1} />
          </mesh>
        </mesh>

        {/* Flash — upper-right area */}
        <mesh position={[LENS_SPACING / 2, LENS_SPACING / 2, -BUMP_PROTRUSION - 0.002]}>
          <cylinderGeometry args={[1.2 * SCALE, 1.2 * SCALE, 0.3 * SCALE, 16]} />
          <meshPhysicalMaterial color="#F0EBD8" metalness={0.0} roughness={0.3} transparent opacity={0.6} />
        </mesh>
      </group>

      {/* ====== SIDE BUTTONS ====== */}
      {/* Left side: Action button, Vol up, Vol down */}
      <group position={[-PHONE_WIDTH / 2 - BTN_PROTRUDE / 2, 0, 0]}>
        {/* Action button — positioned ~34mm from top */}
        <RoundedBox args={[BTN_PROTRUDE, ACTION_BTN_H, BTN_DEPTH]} radius={0.5 * SCALE} smoothness={2}
          position={[0, PHONE_HEIGHT / 2 - 34.0 * SCALE, 0]}>
          <meshPhysicalMaterial {...titaniumProps} />
        </RoundedBox>

        {/* Volume up — ~46mm from top */}
        <RoundedBox args={[BTN_PROTRUDE, VOL_BTN_H, BTN_DEPTH]} radius={0.5 * SCALE} smoothness={2}
          position={[0, PHONE_HEIGHT / 2 - 46.0 * SCALE, 0]}>
          <meshPhysicalMaterial {...titaniumProps} />
        </RoundedBox>

        {/* Volume down — ~60mm from top */}
        <RoundedBox args={[BTN_PROTRUDE, VOL_BTN_H, BTN_DEPTH]} radius={0.5 * SCALE} smoothness={2}
          position={[0, PHONE_HEIGHT / 2 - 60.0 * SCALE, 0]}>
          <meshPhysicalMaterial {...titaniumProps} />
        </RoundedBox>
      </group>

      {/* Right side: Power button, Camera Control */}
      <group position={[PHONE_WIDTH / 2 + BTN_PROTRUDE / 2, 0, 0]}>
        {/* Power/Side button — ~42mm from top */}
        <RoundedBox args={[BTN_PROTRUDE, POWER_BTN_H, BTN_DEPTH]} radius={0.5 * SCALE} smoothness={2}
          position={[0, PHONE_HEIGHT / 2 - 42.0 * SCALE, 0]}>
          <meshPhysicalMaterial {...titaniumProps} />
        </RoundedBox>

        {/* Camera Control button — ~85mm from top (new on iPhone 16 Pro) */}
        <RoundedBox args={[BTN_PROTRUDE, CAM_CTRL_BTN_H, BTN_DEPTH]} radius={0.5 * SCALE} smoothness={2}
          position={[0, PHONE_HEIGHT / 2 - 85.0 * SCALE, 0]}>
          <meshPhysicalMaterial {...titaniumProps} />
        </RoundedBox>
      </group>

      {/* ====== BOTTOM EDGE ====== */}
      <group position={[0, -PHONE_HEIGHT / 2, 0]}>
        {/* USB-C port */}
        <mesh geometry={portGeo} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color="#060606" />
        </mesh>

        {/* Speaker grille — left cluster */}
        {[-17, -15, -13, -11, -9, -7].map((mm) => (
          <mesh key={`spkL${mm}`} geometry={speakerDotGeo}
            position={[mm * SCALE, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <meshBasicMaterial color="#060606" />
          </mesh>
        ))}
        {/* Speaker grille — right cluster */}
        {[7, 9, 11, 13, 15, 17].map((mm) => (
          <mesh key={`spkR${mm}`} geometry={speakerDotGeo}
            position={[mm * SCALE, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <meshBasicMaterial color="#060606" />
          </mesh>
        ))}
      </group>

      {/* ====== TOP EDGE — Microphone ====== */}
      <mesh position={[0, PHONE_HEIGHT / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.4 * SCALE, 0.4 * SCALE, 0.2 * SCALE, 8]} />
        <meshBasicMaterial color="#060606" />
      </mesh>
    </group>
  );
}

/** Render a camera lens + polished ring at a position within the camera array */
function renderLens(
  x: number, y: number,
  lensGeo: CylinderGeometry, ringGeo: RingGeometry,
  bumpDepth: number,
) {
  return (
    <group key={`lens${x}${y}`} position={[x, y, -bumpDepth - 0.005]}>
      <mesh geometry={lensGeo} rotation={[Math.PI / 2, 0, 0]}>
        <meshPhysicalMaterial
          color={LENS_DARK}
          metalness={0.9}
          roughness={0.05}
          clearcoat={1.0}
          clearcoatRoughness={0.02}
          envMapIntensity={1.5}
        />
      </mesh>
      <mesh geometry={ringGeo} position={[0, 0, 0.02]}>
        <meshPhysicalMaterial
          color={RING_POLISH}
          metalness={0.95}
          roughness={0.08}
          envMapIntensity={1.2}
        />
      </mesh>
    </group>
  );
}
