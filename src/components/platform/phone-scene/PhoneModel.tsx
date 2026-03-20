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
 * 2. Front glass panel — inset from frame by bezel width
 * 3. Back glass panel — inset from frame, matte finish
 * 4. Screen (canvas texture) — on top of front glass
 * 5. Buttons — flush-mounted on frame band
 * 6. Camera array — protruding from back glass (upper-left when viewing back)
 * 7. Detail: Apple logo, antenna lines, earpiece, sensors
 */

import { useMemo } from 'react';
import {
  Shape,
  ShapeGeometry,
  ExtrudeGeometry,
  Float32BufferAttribute,
  CylinderGeometry,
  RingGeometry,
  Path,
  type Mesh,
} from 'three';
import { Edges, RoundedBox } from '@react-three/drei';

// ============================================================
// DIMENSIONS — All derived from real iPhone 16 Pro measurements
// Base: PHONE_WIDTH = 2.0 units = 71.5mm real
// Scale: 1mm = 0.02797 units
// ============================================================
const S = 2.0 / 71.5; // Scale: units per mm

const PHONE_WIDTH = 71.5 * S;   // 2.0
const PHONE_HEIGHT = 149.6 * S; // 4.184
const PHONE_DEPTH = 8.25 * S;   // 0.2308

const CORNER_RADIUS = 5.5 * S;  // Frame corner radius
const BEZEL = 1.2 * S;          // Screen to frame gap
const FRAME_BAND = 2.8 * S;     // Titanium side wall thickness

// Screen (inset by bezel)
const SCREEN_WIDTH = PHONE_WIDTH - BEZEL * 2;
const SCREEN_HEIGHT = PHONE_HEIGHT - BEZEL * 2;
const SCREEN_CR = CORNER_RADIUS - BEZEL;

// Camera — reduced protrusion for better visual proportion
const CAM_BUMP_DEPTH = 2.2 * S;     // Thinner than real 3.9mm — looks better in 3D
const CAM_BUMP_SIZE = 26.0 * S;     // Housing square ~26mm
const CAM_BUMP_CR = 5.5 * S;        // Housing corner radius
const CAM_LENS_R = 4.8 * S;         // Lens radius
const CAM_RING_IN = 4.2 * S;        // Ring inner
const CAM_RING_OUT = 5.6 * S;       // Ring outer
const CAM_SPACING = 10.5 * S;       // Center-to-center lens spacing

// Camera position — upper-left when viewing the back
// On real phone: centered ~13mm from left edge, ~14mm from top edge
// Viewing back (-Z), left = +X direction
const CAM_X = (71.5 / 2 - 13.0) * S;  // +X = left side of back
const CAM_Y = (149.6 / 2 - 17.0) * S; // Near top

// Button dimensions
const BTN_PROTRUDE = 0.6 * S;
const BTN_DEPTH_Z = 2.8 * S;

export { SCREEN_WIDTH, SCREEN_HEIGHT };

// --- Colors: Black Titanium ---
const TITANIUM = '#1C1C1E';
const BACK_GLASS = '#121214';
const FRONT_GLASS = '#0A0A0A';
const CAM_HOUSING = '#0E0E10';
const LENS_DARK = '#050508';
const RING_POLISH = '#2E2E30';

// --- Shape helper ---
function rr(w: number, h: number, r: number): Shape {
  const hw = w / 2, hh = h / 2, cr = Math.min(r, hw, hh);
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

// --- Apple logo shape (simplified silhouette) ---
function appleLogoShape(size: number): Shape {
  const s = size;
  const shape = new Shape();
  // Apple body — two overlapping circles to approximate the apple shape
  // Bottom-heavy curve
  shape.moveTo(0, -s * 0.5);
  shape.bezierCurveTo(s * 0.5, -s * 0.5, s * 0.55, -s * 0.1, s * 0.45, s * 0.2);
  shape.bezierCurveTo(s * 0.35, s * 0.45, s * 0.15, s * 0.5, 0, s * 0.35);
  shape.bezierCurveTo(-s * 0.15, s * 0.5, -s * 0.35, s * 0.45, -s * 0.45, s * 0.2);
  shape.bezierCurveTo(-s * 0.55, -s * 0.1, -s * 0.5, -s * 0.5, 0, -s * 0.5);

  // Bite (hole on right side)
  const bite = new Path();
  bite.moveTo(s * 0.35, s * 0.05);
  bite.bezierCurveTo(s * 0.55, s * 0.15, s * 0.55, -s * 0.15, s * 0.35, -s * 0.05);
  bite.bezierCurveTo(s * 0.42, -s * 0.02, s * 0.42, s * 0.02, s * 0.35, s * 0.05);
  shape.holes.push(bite);

  return shape;
}

interface PhoneModelProps {
  screenRef?: React.Ref<Mesh>;
}

export default function PhoneModel({ screenRef }: PhoneModelProps) {
  // --- Geometries (all memoized) ---
  const screenGeo = useMemo(() => {
    const shape = rr(SCREEN_WIDTH, SCREEN_HEIGHT, SCREEN_CR);
    const geo = new ShapeGeometry(shape);
    const hw = SCREEN_WIDTH / 2, hh = SCREEN_HEIGHT / 2;
    const uvAttr = geo.attributes.uv;
    const a = new Float32Array(uvAttr.count * 2);
    for (let i = 0; i < uvAttr.count; i++) {
      a[i * 2] = (uvAttr.getX(i) + hw) / (hw * 2);
      a[i * 2 + 1] = (uvAttr.getY(i) + hh) / (hh * 2);
    }
    geo.setAttribute('uv', new Float32BufferAttribute(a, 2));
    return geo;
  }, []);

  const frameBandGeo = useMemo(() => {
    const outer = rr(PHONE_WIDTH, PHONE_HEIGHT, CORNER_RADIUS);
    const inner = rr(PHONE_WIDTH - FRAME_BAND * 2, PHONE_HEIGHT - FRAME_BAND * 2, CORNER_RADIUS - FRAME_BAND);
    outer.holes.push(inner);
    return new ExtrudeGeometry(outer, { depth: PHONE_DEPTH, bevelEnabled: false });
  }, []);

  const glassW = PHONE_WIDTH - FRAME_BAND * 2;
  const glassH = PHONE_HEIGHT - FRAME_BAND * 2;
  const glassCR = CORNER_RADIUS - FRAME_BAND;
  const frontGlassGeo = useMemo(() => new ShapeGeometry(rr(glassW, glassH, glassCR)), []);
  const backGlassGeo = useMemo(() => new ShapeGeometry(rr(glassW, glassH, glassCR)), []);

  // Camera
  const lensGeo = useMemo(() => new CylinderGeometry(CAM_LENS_R, CAM_LENS_R, 0.03, 32), []);
  const ringGeo = useMemo(() => new RingGeometry(CAM_RING_IN, CAM_RING_OUT, 32), []);
  const smallLensGeo = useMemo(() => new CylinderGeometry(1.5 * S, 1.5 * S, 0.015, 16), []);
  const bumpGeo = useMemo(() => {
    const shape = rr(CAM_BUMP_SIZE, CAM_BUMP_SIZE, CAM_BUMP_CR);
    return new ExtrudeGeometry(shape, { depth: CAM_BUMP_DEPTH, bevelEnabled: false });
  }, []);

  // Apple logo
  const logoGeo = useMemo(() => new ShapeGeometry(appleLogoShape(6.0 * S)), []);

  // Bottom details
  const speakerDotGeo = useMemo(() => new CylinderGeometry(0.5 * S, 0.5 * S, 0.3 * S, 8), []);
  const portGeo = useMemo(() => new ShapeGeometry(rr(6.5 * S, 2.0 * S, 1.0 * S)), []);

  // Earpiece
  const earpieceGeo = useMemo(() => new ShapeGeometry(rr(8.0 * S, 1.2 * S, 0.6 * S)), []);

  // Titanium material (shared)
  const tiProps = {
    color: TITANIUM, metalness: 0.7, roughness: 0.5,
    clearcoat: 0.12, clearcoatRoughness: 0.6, envMapIntensity: 0.45,
  } as const;

  return (
    <group>
      {/* ====== TITANIUM FRAME BAND ====== */}
      <mesh geometry={frameBandGeo} position={[0, 0, -PHONE_DEPTH / 2]}>
        <meshPhysicalMaterial {...tiProps} />
      </mesh>
      <mesh geometry={frameBandGeo} position={[0, 0, -PHONE_DEPTH / 2]}>
        <meshBasicMaterial visible={false} />
        <Edges threshold={12} color="#FFFFFF" lineWidth={1.0} opacity={0.08} transparent />
      </mesh>

      {/* Antenna band lines — subtle grooves in the titanium frame */}
      {/* Top-left and top-right antenna breaks */}
      {[
        [-PHONE_WIDTH / 2, PHONE_HEIGHT / 2 - 22 * S],
        [PHONE_WIDTH / 2, PHONE_HEIGHT / 2 - 22 * S],
        [-PHONE_WIDTH / 2, -PHONE_HEIGHT / 2 + 18 * S],
        [PHONE_WIDTH / 2, -PHONE_HEIGHT / 2 + 18 * S],
      ].map(([x, y], i) => (
        <mesh key={`ant${i}`} position={[x, y, 0]}>
          <boxGeometry args={[FRAME_BAND + 0.002, 0.4 * S, PHONE_DEPTH * 0.7]} />
          <meshBasicMaterial color="#151517" transparent opacity={0.5} />
        </mesh>
      ))}

      {/* ====== FRONT GLASS PANEL ====== */}
      <mesh geometry={frontGlassGeo} position={[0, 0, PHONE_DEPTH / 2 - 0.001]}>
        <meshPhysicalMaterial
          color={FRONT_GLASS} metalness={0.0} roughness={0.1}
          clearcoat={0.8} clearcoatRoughness={0.08} envMapIntensity={0.6}
        />
      </mesh>

      {/* ====== BACK GLASS PANEL ====== */}
      <mesh geometry={backGlassGeo} position={[0, 0, -PHONE_DEPTH / 2 + 0.001]} rotation={[0, Math.PI, 0]}>
        <meshPhysicalMaterial
          color={BACK_GLASS} metalness={0.05} roughness={0.65}
          clearcoat={0.25} clearcoatRoughness={0.4} envMapIntensity={0.3}
        />
      </mesh>

      {/* ====== APPLE LOGO (back, centered, polished finish) ====== */}
      <mesh geometry={logoGeo} position={[0, -5 * S, -PHONE_DEPTH / 2 - 0.001]} rotation={[0, Math.PI, 0]}>
        <meshPhysicalMaterial
          color="#1E1E20" metalness={0.6} roughness={0.1}
          clearcoat={1.0} clearcoatRoughness={0.05} envMapIntensity={0.9}
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
          color="#000000" transparent opacity={0.05} roughness={0.05}
          clearcoat={1.0} clearcoatRoughness={0.05} envMapIntensity={0.8}
        />
      </mesh>

      {/* ====== DYNAMIC ISLAND ====== */}
      <RoundedBox
        args={[15 * S, 4 * S, 0.3 * S]} radius={2 * S} smoothness={3}
        position={[0, SCREEN_HEIGHT / 2 - 6 * S, PHONE_DEPTH / 2 + 0.003]}
      >
        <meshBasicMaterial color="#000000" />
      </RoundedBox>

      {/* ====== EARPIECE / FRONT SPEAKER ====== */}
      <mesh geometry={earpieceGeo}
        position={[0, PHONE_HEIGHT / 2 - 2 * S, PHONE_DEPTH / 2 + 0.001]}>
        <meshBasicMaterial color="#080808" />
      </mesh>

      {/* ====== FRONT SENSORS (ambient light, proximity — tiny dots near Dynamic Island) ====== */}
      {[-3.5, 3.5].map((xOff) => (
        <mesh key={`sens${xOff}`}
          position={[xOff * S + (xOff > 0 ? 9 * S : -9 * S), SCREEN_HEIGHT / 2 - 6 * S, PHONE_DEPTH / 2 + 0.004]}>
          <cylinderGeometry args={[0.5 * S, 0.5 * S, 0.1 * S, 8]} />
          <meshBasicMaterial color="#0A0A0A" transparent opacity={0.6} />
        </mesh>
      ))}

      {/* ====== CAMERA ARRAY (back, upper-left when viewing back) ====== */}
      <group position={[CAM_X, CAM_Y, -PHONE_DEPTH / 2]}>
        {/* Camera bump housing — polished (distinct from matte back) */}
        <mesh geometry={bumpGeo} rotation={[Math.PI, 0, 0]}>
          <meshPhysicalMaterial
            color={CAM_HOUSING} metalness={0.3} roughness={0.1}
            clearcoat={0.9} clearcoatRoughness={0.05} envMapIntensity={0.7}
          />
        </mesh>
        <mesh geometry={bumpGeo} rotation={[Math.PI, 0, 0]}>
          <meshBasicMaterial visible={false} />
          <Edges threshold={15} color="#FFFFFF" lineWidth={0.8} opacity={0.06} transparent />
        </mesh>

        {/* Triangular lens arrangement */}
        {/* Main/Fusion — lower-left */}
        {renderLens(-CAM_SPACING / 2, -CAM_SPACING / 2, lensGeo, ringGeo, CAM_BUMP_DEPTH)}
        {/* Ultra-wide — upper-left */}
        {renderLens(-CAM_SPACING / 2, CAM_SPACING / 2, lensGeo, ringGeo, CAM_BUMP_DEPTH)}
        {/* Telephoto — right center */}
        {renderLens(CAM_SPACING / 2, 0, lensGeo, ringGeo, CAM_BUMP_DEPTH)}

        {/* LiDAR — bottom-right quadrant */}
        <mesh position={[CAM_SPACING / 2, -CAM_SPACING / 2, -CAM_BUMP_DEPTH - 0.002]}>
          <mesh geometry={smallLensGeo} rotation={[Math.PI / 2, 0, 0]}>
            <meshPhysicalMaterial color="#12101A" metalness={0.6} roughness={0.15} clearcoat={0.5} clearcoatRoughness={0.1} />
          </mesh>
        </mesh>

        {/* Flash — upper-right quadrant */}
        <mesh position={[CAM_SPACING / 2, CAM_SPACING / 2, -CAM_BUMP_DEPTH - 0.001]}>
          <cylinderGeometry args={[1.3 * S, 1.3 * S, 0.2 * S, 16]} />
          <meshPhysicalMaterial color="#F0EBD8" metalness={0.0} roughness={0.3} transparent opacity={0.5} />
        </mesh>

        {/* Microphone pinhole */}
        <mesh position={[0, CAM_BUMP_SIZE / 2 - 1.5 * S, -CAM_BUMP_DEPTH - 0.001]}>
          <cylinderGeometry args={[0.3 * S, 0.3 * S, 0.1 * S, 8]} />
          <meshBasicMaterial color="#050505" />
        </mesh>
      </group>

      {/* ====== SIDE BUTTONS ====== */}
      {/* Left: Action button, Vol up, Vol down */}
      <group position={[-PHONE_WIDTH / 2 - BTN_PROTRUDE / 2, 0, 0]}>
        {/* Action button — ~34mm from top */}
        <RoundedBox args={[BTN_PROTRUDE, 5.5 * S, BTN_DEPTH_Z]} radius={0.5 * S} smoothness={2}
          position={[0, PHONE_HEIGHT / 2 - 34 * S, 0]}>
          <meshPhysicalMaterial {...tiProps} />
        </RoundedBox>
        {/* Volume up — ~46mm from top */}
        <RoundedBox args={[BTN_PROTRUDE, 10 * S, BTN_DEPTH_Z]} radius={0.5 * S} smoothness={2}
          position={[0, PHONE_HEIGHT / 2 - 46 * S, 0]}>
          <meshPhysicalMaterial {...tiProps} />
        </RoundedBox>
        {/* Volume down — ~60mm from top */}
        <RoundedBox args={[BTN_PROTRUDE, 10 * S, BTN_DEPTH_Z]} radius={0.5 * S} smoothness={2}
          position={[0, PHONE_HEIGHT / 2 - 60 * S, 0]}>
          <meshPhysicalMaterial {...tiProps} />
        </RoundedBox>
      </group>

      {/* Right: Power, Camera Control */}
      <group position={[PHONE_WIDTH / 2 + BTN_PROTRUDE / 2, 0, 0]}>
        {/* Power — ~42mm from top */}
        <RoundedBox args={[BTN_PROTRUDE, 13 * S, BTN_DEPTH_Z]} radius={0.5 * S} smoothness={2}
          position={[0, PHONE_HEIGHT / 2 - 42 * S, 0]}>
          <meshPhysicalMaterial {...tiProps} />
        </RoundedBox>
        {/* Camera Control — ~85mm from top (capacitive, slightly recessed) */}
        <RoundedBox args={[BTN_PROTRUDE, 7 * S, BTN_DEPTH_Z]} radius={0.5 * S} smoothness={2}
          position={[0, PHONE_HEIGHT / 2 - 85 * S, 0]}>
          <meshPhysicalMaterial
            color="#18181A" metalness={0.75} roughness={0.3}
            clearcoat={0.3} clearcoatRoughness={0.2} envMapIntensity={0.5}
          />
        </RoundedBox>
      </group>

      {/* ====== BOTTOM EDGE ====== */}
      <group position={[0, -PHONE_HEIGHT / 2, 0]}>
        {/* USB-C port */}
        <mesh geometry={portGeo} rotation={[Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color="#060606" />
        </mesh>
        {/* Speaker grille — left cluster */}
        {[-17, -15, -13, -11, -9, -7].map((mm) => (
          <mesh key={`spkL${mm}`} geometry={speakerDotGeo}
            position={[mm * S, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <meshBasicMaterial color="#060606" />
          </mesh>
        ))}
        {/* Speaker grille — right cluster */}
        {[7, 9, 11, 13, 15, 17].map((mm) => (
          <mesh key={`spkR${mm}`} geometry={speakerDotGeo}
            position={[mm * S, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <meshBasicMaterial color="#060606" />
          </mesh>
        ))}
      </group>

      {/* ====== TOP EDGE — Microphone ====== */}
      <mesh position={[0, PHONE_HEIGHT / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.4 * S, 0.4 * S, 0.2 * S, 8]} />
        <meshBasicMaterial color="#060606" />
      </mesh>
    </group>
  );
}

/** Camera lens + polished metallic ring */
function renderLens(
  x: number, y: number,
  lensGeo: CylinderGeometry, ringGeo: RingGeometry,
  bumpDepth: number,
) {
  return (
    <group key={`lens${x}${y}`} position={[x, y, -bumpDepth - 0.003]}>
      <mesh geometry={lensGeo} rotation={[Math.PI / 2, 0, 0]}>
        <meshPhysicalMaterial
          color={LENS_DARK} metalness={0.9} roughness={0.05}
          clearcoat={1.0} clearcoatRoughness={0.02} envMapIntensity={1.5}
        />
      </mesh>
      <mesh geometry={ringGeo} position={[0, 0, 0.015]}>
        <meshPhysicalMaterial
          color={RING_POLISH} metalness={0.95} roughness={0.08} envMapIntensity={1.2}
        />
      </mesh>
    </group>
  );
}
