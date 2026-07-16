'use client';

/**
 * PhoneModel — iPhone 16 Pro, accurate construction, in OPS field trim.
 *
 * Vendored from the platform scene's newest hardware (the approved 2026-07-10
 * "morph" direction) with the exploration scaffolding removed: this is the
 * winner as the only rendering. One look —
 *
 *   · murdered-out powder-coat body (dielectric sprayed polymer skin, not
 *     bare metal — Jackson's call, 2026-07-10 design doc)
 *   · OPS mark badge where the Apple logo would sit (this is OPS field
 *     hardware, not an iPhone ad)
 *   · dark machined-steel camera rings, soft-touch matte back glass
 *   · real smudged screen glass (CC0 fingerprint clearcoat-roughness map) —
 *     the object reads touched, a tool that gets used
 *   · the full technical drawing mounted dark over the body — MorphRig
 *     resolves the powder coat into the hairline contour drawing when the
 *     spec page's BUILD zone owns the phone
 *
 * Real dimensions: 71.5mm × 149.6mm × 8.25mm
 * Base unit: PHONE_WIDTH = 2.0 = 71.5mm → Scale: 1mm = 0.02797 units
 *
 * Visual adjustments for 3D rendering:
 * - Depth reduced to 6.8mm (from 8.25mm) — thinner reads better in 3D
 * - Camera bump 2.2mm (from 3.9mm real)
 * - Corner radius 8.5mm with cubic bezier circular arcs
 * - Frame band beveled for edge detail (chamfered front/back edges)
 * - Camera lens rings are 3D barrels (cylinder + ring face), not flat
 */

import { useMemo } from 'react';
import {
  Shape,
  ShapeGeometry,
  ExtrudeGeometry,
  Float32BufferAttribute,
  BufferGeometry,
  CylinderGeometry,
  RingGeometry,
  CircleGeometry,
  EllipseCurve,
  Vector3,
  DoubleSide,
  type Mesh,
} from 'three';
import { useLoader } from '@react-three/fiber';
import { RoundedBox, Text3D, Center, useTexture } from '@react-three/drei';
import { LinearSRGBColorSpace, RepeatWrapping } from 'three';
import { SVGLoader } from 'three-stdlib';

// ============================================================
// DIMENSIONS
// ============================================================
const S = 2.0 / 71.5; // Scale: units per mm

const PHONE_WIDTH = 71.5 * S;   // 2.0
const PHONE_HEIGHT = 149.6 * S; // 4.184
const PHONE_DEPTH = 6.8 * S;    // Aggressively reduced for slim 3D profile

const CORNER_RADIUS = 8.5 * S;  // Real ~8.5mm
const BEZEL = 1.2 * S;
const FRAME_BAND = 2.5 * S;

// Frame bevel — creates chamfered edges where frame meets glass
const BEVEL_SIZE = 0.35 * S;       // Slightly larger chamfer
const BEVEL_THICKNESS = 0.3 * S;   // Slightly deeper chamfer
const FRAME_EXTRUDE_DEPTH = PHONE_DEPTH - 2 * BEVEL_THICKNESS; // Body depth (bevel adds the rest)

// Screen (inset by bezel)
const SCREEN_WIDTH = PHONE_WIDTH - BEZEL * 2;
const SCREEN_HEIGHT = PHONE_HEIGHT - BEZEL * 2;
const SCREEN_CR = CORNER_RADIUS - BEZEL;

// Camera — proportions matched to real iPhone 16 Pro
const CAM_BUMP_DEPTH = 2.2 * S;
const CAM_BUMP_SIZE = 30.0 * S;
const CAM_BUMP_CR = 6.5 * S;
const CAM_LENS_R = 4.5 * S;
const CAM_RING_IN = 4.2 * S;
const CAM_RING_OUT = 5.2 * S;
const CAM_SPACING = 11.5 * S;
const RING_PROTRUDE = 1.5 * S;

// Camera position — upper-left when viewing the back
const CAM_X = (71.5 / 2 - 16.0) * S;
const CAM_Y = (149.6 / 2 - 17.0) * S;

// Buttons
const BTN_PROTRUDE = 0.6 * S;
const BTN_DEPTH_Z = 2.8 * S;

export { SCREEN_WIDTH, SCREEN_HEIGHT, PHONE_WIDTH, PHONE_HEIGHT, PHONE_DEPTH, S };

// ============================================================
// MATERIAL RECIPES
// ============================================================

// Powder-coat body — murdered-out site equipment (Jackson's call, 2026-07-10
// design doc). Powder coat is a sprayed polymer skin, not bare metal:
// dielectric (metalness 0 — the paint hides the aluminum), high roughness
// for the broad soft sheen of a coated part, zero clearcoat (no lacquer),
// and no anisotropy (a coating has no brushing direction). The key/rim rig
// carves the silhouette; env stays low so the finish reads matte site
// equipment, not showroom metal.
const powderProps = {
  color: '#1D1D20',
  metalness: 0,
  roughness: 0.74,
  specularIntensity: 0.55,
  clearcoat: 0,
  clearcoatRoughness: 0,
  envMapIntensity: 0.38,
} as const;

// OPS mark badge: polished metal inlay under glass clearcoat
const logoMat = {
  color: '#222224', metalness: 0.85, roughness: 0.08,
  clearcoat: 1.0, clearcoatRoughness: 0.02, envMapIntensity: 1.2,
} as const;

// Camera rings: dark machined steel, not mirror polish — matches the coat.
const ringProps = {
  color: '#3A3A3E',
  metalness: 1,
  roughness: 0.3,
  envMapIntensity: 1.0,
} as const;

// Morph material tags — the contract MorphRig drives (see morph-channel.ts).
// M_FILL: opaque solid-state fills; polygonOffset pushes them back so the
// drawing's surface-coincident ink wins depth once it fades in. M_DECAL:
// surface decals (already transparent or depthWrite-tweaked) — tag only,
// no depth bias.
const M_FILL = {
  userData: { morphFill: true },
  polygonOffset: true,
  polygonOffsetFactor: 1,
  polygonOffsetUnits: 1,
} as const;
const M_DECAL = { userData: { morphFill: true } } as const;

// --- Cubic bezier rounded rect ---
function rr(w: number, h: number, r: number): Shape {
  const hw = w / 2, hh = h / 2, cr = Math.min(r, hw, hh);
  // Apple squircle approximation — higher k = tighter corner that hugs the vertex
  // Standard circle: k = 0.5523 | Squircle (G2-ish): k = 0.6 gives smoother curvature onset
  const k = 0.6;
  const kc = cr * k;
  const shape = new Shape();
  shape.moveTo(-hw + cr, -hh);
  shape.lineTo(hw - cr, -hh);
  shape.bezierCurveTo(hw - cr + kc, -hh, hw, -hh + cr - kc, hw, -hh + cr);
  shape.lineTo(hw, hh - cr);
  shape.bezierCurveTo(hw, hh - cr + kc, hw - cr + kc, hh, hw - cr, hh);
  shape.lineTo(-hw + cr, hh);
  shape.bezierCurveTo(-hw + cr - kc, hh, -hw, hh - cr + kc, -hw, hh - cr);
  shape.lineTo(-hw, -hh + cr);
  shape.bezierCurveTo(-hw, -hh + cr - kc, -hw + cr - kc, -hh, -hw + cr, -hh);
  return shape;
}

interface PhoneModelProps {
  screenRef?: React.Ref<Mesh>;
}

export default function PhoneModel({ screenRef }: PhoneModelProps) {
  // --- Geometries ---
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

  // Main frame — full ring, full depth, beveled
  const frameBandGeo = useMemo(() => {
    const outer = rr(PHONE_WIDTH, PHONE_HEIGHT, CORNER_RADIUS);
    const inner = rr(
      PHONE_WIDTH - FRAME_BAND * 2,
      PHONE_HEIGHT - FRAME_BAND * 2,
      Math.max(CORNER_RADIUS - FRAME_BAND, 0),
    );
    outer.holes.push(inner);
    return new ExtrudeGeometry(outer, {
      depth: FRAME_EXTRUDE_DEPTH,
      bevelEnabled: true,
      bevelSize: BEVEL_SIZE,
      bevelThickness: BEVEL_THICKNESS,
      bevelSegments: 3,
    });
  }, []);

  // USB-C port dimensions
  const PORT_W = 7.0 * S;
  const PORT_H = 1.6 * S;
  const PORT_R = 0.5 * S;

  const glassW = PHONE_WIDTH - FRAME_BAND * 2;
  const glassH = PHONE_HEIGHT - FRAME_BAND * 2;
  const glassCR = Math.max(CORNER_RADIUS - FRAME_BAND, 0);
  const frontGlassGeo = useMemo(() => new ShapeGeometry(rr(glassW, glassH, glassCR)), []);
  const backGlassGeo = useMemo(() => new ShapeGeometry(rr(glassW, glassH, glassCR)), []);

  // Camera geometries
  const ringFaceGeo = useMemo(() => new RingGeometry(CAM_RING_IN, CAM_RING_OUT, 48), []);
  const ringBarrelGeo = useMemo(
    () => new CylinderGeometry(CAM_RING_OUT, CAM_RING_OUT, RING_PROTRUDE, 48, 1, true), [],
  );
  const lensGeo = useMemo(() => new CircleGeometry(CAM_LENS_R, 48), []);
  const coatingRingGeo = useMemo(() => new RingGeometry(CAM_LENS_R * 0.5, CAM_LENS_R * 0.8, 32), []);
  const innerElementGeo = useMemo(() => new RingGeometry(CAM_LENS_R * 0.25, CAM_LENS_R * 0.4, 24), []);
  const bumpGeo = useMemo(() => {
    const shape = rr(CAM_BUMP_SIZE, CAM_BUMP_SIZE, CAM_BUMP_CR);
    return new ExtrudeGeometry(shape, {
      depth: CAM_BUMP_DEPTH,
      bevelEnabled: true,
      bevelSize: 1.0 * S,
      bevelThickness: 0.8 * S,
      bevelSegments: 5,
    });
  }, []);

  // Bottom details
  const speakerDotGeo = useMemo(() => new CylinderGeometry(0.5 * S, 0.5 * S, 0.3 * S, 8), []);

  // Earpiece
  const earpieceGeo = useMemo(() => new ShapeGeometry(rr(9.0 * S, 1.0 * S, 0.5 * S)), []);

  // Frame position offset — accounts for bevel extending beyond body
  const frameZ = -PHONE_DEPTH / 2 + BEVEL_THICKNESS;

  return (
    <group>
      {/* ====== POWDER-COAT FRAME BAND (beveled edges) ====== */}
      <mesh geometry={frameBandGeo} position={[0, 0, frameZ]}>
        <meshPhysicalMaterial {...powderProps} {...M_FILL} />
      </mesh>

      {/* Antenna band lines — dark hairline slots on the frame surface.
          Two planes per line (left-facing and right-facing) sitting flush on the frame edge. */}
      {[
        { x: -PHONE_WIDTH / 2 - 0.003, y: PHONE_HEIGHT / 2 - 22 * S },
        { x: PHONE_WIDTH / 2 + 0.003, y: PHONE_HEIGHT / 2 - 22 * S },
        { x: -PHONE_WIDTH / 2 - 0.003, y: -PHONE_HEIGHT / 2 + 18 * S },
        { x: PHONE_WIDTH / 2 + 0.003, y: -PHONE_HEIGHT / 2 + 18 * S },
      ].map(({ x, y }, i) => (
        <mesh key={`ant${i}`} position={[x, y, 0]}
          rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[PHONE_DEPTH * 0.55, 0.3 * S]} />
          <meshBasicMaterial color="#0A0A0C" side={DoubleSide} depthWrite={false} {...M_DECAL} />
        </mesh>
      ))}

      {/* ====== FRONT GLASS PANEL ====== */}
      <mesh geometry={frontGlassGeo} position={[0, 0, PHONE_DEPTH / 2 - 0.002]}>
        <meshPhysicalMaterial
          color="#0A0A0A" metalness={0} roughness={0.05}
          clearcoat={1} clearcoatRoughness={0.03}
          ior={1.52} reflectivity={0.5} envMapIntensity={0.8}
          {...M_FILL}
        />
      </mesh>

      {/* ====== BACK GLASS PANEL ====== */}
      {/* Soft-touch matte glass — matches the coated body, no gloss layer */}
      <mesh geometry={backGlassGeo} position={[0, 0, -PHONE_DEPTH / 2 + 0.002]} rotation={[0, Math.PI, 0]}>
        <meshPhysicalMaterial
          color="#141416"
          metalness={0}
          roughness={0.5}
          clearcoat={0.1}
          clearcoatRoughness={0.4}
          ior={1.52}
          envMapIntensity={0.35}
          {...M_FILL}
        />
      </mesh>

      {/* ====== BACK BADGE — the OPS mark. This is OPS field hardware. ====== */}
      <OpsMarkBadge />

      {/* ====== SCREEN — Self-lit OLED display under real smudged glass ======
           Emissive: screen content via CanvasTexture (applied by SpecPhoneInteraction)
           Glass: full Gorilla-Glass clearcoat with a CC0 fingerprint-smudge
           clearcoatRoughness map — the pads break the studio rig's light band
           exactly where fingers land, so the object reads touched, a tool that
           gets used. MorphRig drives clearcoat/env/reflectivity → 0 on the
           glass channel: real glass in the hero, zero-glare perfect display
           when the screen is the story (the marketing convention — Apple's own
           guidelines prohibit screen reflections in product imagery). */}
      <mesh ref={screenRef} position={[0, 0, PHONE_DEPTH / 2 + 0.001]}>
        <primitive object={screenGeo} attach="geometry" />
        <ScreenGlassMaterial />
      </mesh>

      {/* ====== DYNAMIC ISLAND — Pill-shaped cutout flush with the screen ====== */}
      <mesh position={[0, SCREEN_HEIGHT / 2 - 6 * S, PHONE_DEPTH / 2 + 0.002]}>
        <shapeGeometry args={[rr(15 * S, 4 * S, 2 * S)]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* ====== EARPIECE ====== */}
      <mesh geometry={earpieceGeo}
        position={[0, PHONE_HEIGHT / 2 - 1.5 * S, PHONE_DEPTH / 2 + 0.002]}>
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* ====== FRONT SENSORS ====== */}
      {[-1, 1].map((side) => (
        <mesh key={`sens${side}`}
          position={[side * 9 * S, SCREEN_HEIGHT / 2 - 6 * S, PHONE_DEPTH / 2 + 0.004]}>
          <circleGeometry args={[0.4 * S, 8]} />
          <meshBasicMaterial color="#060608" transparent opacity={0.3} {...M_DECAL} />
        </mesh>
      ))}

      {/* ====== CAMERA ARRAY ====== */}
      <group position={[CAM_X, CAM_Y, -PHONE_DEPTH / 2]}>
        {/* Camera bump housing — matte, no clearcoat: coated like the body */}
        <mesh geometry={bumpGeo} rotation={[Math.PI, 0, 0]}>
          <meshPhysicalMaterial
            color="#0E0E10"
            metalness={0}
            roughness={0.5}
            clearcoat={0}
            clearcoatRoughness={0.2}
            ior={1.52}
            envMapIntensity={0.5}
            {...M_FILL}
          />
        </mesh>

        {/* 3D lens assemblies — from back view: two on LEFT column, one on RIGHT center */}
        {renderLens(CAM_SPACING / 2, CAM_SPACING / 2, ringBarrelGeo, ringFaceGeo, lensGeo, coatingRingGeo, innerElementGeo)}
        {renderLens(CAM_SPACING / 2, -CAM_SPACING / 2, ringBarrelGeo, ringFaceGeo, lensGeo, coatingRingGeo, innerElementGeo)}
        {renderLens(-CAM_SPACING / 2, 0, ringBarrelGeo, ringFaceGeo, lensGeo, coatingRingGeo, innerElementGeo)}

        {/* LiDAR — lower-right from back view */}
        <mesh position={[-CAM_SPACING / 2, -CAM_SPACING / 2, -CAM_BUMP_DEPTH - 0.002]}
          rotation={[Math.PI, 0, 0]}>
          <circleGeometry args={[1.5 * S, 16]} />
          <meshPhysicalMaterial
            color="#0a0a14" metalness={0} roughness={0.2}
            clearcoat={0.6} clearcoatRoughness={0.15}
            ior={1.52} envMapIntensity={0.6}
            {...M_FILL}
          />
        </mesh>

        {/* Flash — upper-right from back view */}
        <mesh position={[-CAM_SPACING / 2, CAM_SPACING / 2, -CAM_BUMP_DEPTH - 0.001]}
          rotation={[Math.PI, 0, 0]}>
          <circleGeometry args={[1.3 * S, 16]} />
          <meshPhysicalMaterial
            color="#F0EBD8" metalness={0.0} roughness={0.3}
            transparent opacity={0.85}
            {...M_DECAL}
          />
        </mesh>

        {/* Microphone pinhole */}
        <mesh position={[0, CAM_BUMP_SIZE / 2 - 1.5 * S, -CAM_BUMP_DEPTH - 0.001]}
          rotation={[Math.PI, 0, 0]}>
          <circleGeometry args={[0.3 * S, 8]} />
          <meshBasicMaterial color="#050505" />
        </mesh>
      </group>

      {/* ====== SIDE BUTTONS ====== */}
      <group position={[-PHONE_WIDTH / 2 - BTN_PROTRUDE / 2, 0, 0]}>
        <RoundedBox args={[BTN_PROTRUDE, 5.5 * S, BTN_DEPTH_Z]} radius={0.5 * S} smoothness={2}
          position={[0, PHONE_HEIGHT / 2 - 34 * S, 0]}>
          <meshPhysicalMaterial {...powderProps} {...M_FILL} />
        </RoundedBox>
        <RoundedBox args={[BTN_PROTRUDE, 10 * S, BTN_DEPTH_Z]} radius={0.5 * S} smoothness={2}
          position={[0, PHONE_HEIGHT / 2 - 46 * S, 0]}>
          <meshPhysicalMaterial {...powderProps} {...M_FILL} />
        </RoundedBox>
        <RoundedBox args={[BTN_PROTRUDE, 10 * S, BTN_DEPTH_Z]} radius={0.5 * S} smoothness={2}
          position={[0, PHONE_HEIGHT / 2 - 60 * S, 0]}>
          <meshPhysicalMaterial {...powderProps} {...M_FILL} />
        </RoundedBox>
      </group>

      <group position={[PHONE_WIDTH / 2 + BTN_PROTRUDE / 2, 0, 0]}>
        <RoundedBox args={[BTN_PROTRUDE, 13 * S, BTN_DEPTH_Z]} radius={0.5 * S} smoothness={2}
          position={[0, PHONE_HEIGHT / 2 - 42 * S, 0]}>
          <meshPhysicalMaterial {...powderProps} {...M_FILL} />
        </RoundedBox>
        <RoundedBox args={[BTN_PROTRUDE, 7 * S, BTN_DEPTH_Z]} radius={0.5 * S} smoothness={2}
          position={[0, PHONE_HEIGHT / 2 - 85 * S, 0]}>
          {/* Camera Control button — sapphire crystal cover (IOR 1.77) */}
          <meshPhysicalMaterial
            color="#18181A" metalness={0} roughness={0.08}
            clearcoat={1} clearcoatRoughness={0.05}
            ior={1.77} reflectivity={0.6} envMapIntensity={0.9}
            {...M_FILL}
          />
        </RoundedBox>
      </group>

      {/* ====== BOTTOM EDGE — USB-C port + speaker grilles ====== */}
      <group position={[0, -PHONE_HEIGHT / 2, 0]}>
        <mesh position={[0, -0.003, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <shapeGeometry args={[rr(PORT_W, PORT_H, PORT_R)]} />
          <meshBasicMaterial color="#030303" side={DoubleSide} />
        </mesh>

        {[-4, -3, -2].map((i) => (
          <mesh key={`spkL${i}`} geometry={speakerDotGeo}
            position={[(i * 3.0) * S, -0.003, 0]}
            rotation={[Math.PI / 2, 0, 0]}>
            <meshBasicMaterial color="#060606" />
          </mesh>
        ))}

        {[2, 3, 4].map((i) => (
          <mesh key={`spkR${i}`} geometry={speakerDotGeo}
            position={[(i * 3.0) * S, -0.003, 0]}
            rotation={[Math.PI / 2, 0, 0]}>
            <meshBasicMaterial color="#060606" />
          </mesh>
        ))}
      </group>

      {/* ====== TOP EDGE — Easter egg engraving ====== */}
      <group position={[0, PHONE_HEIGHT / 2, 0]}>
        {/* Engraved text cut into the top edge.
            Text3D creates real extruded geometry with depth (0.4mm).
            Dark color simulates the shadow inside the engraving. */}
        <Center precise position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <Text3D
            font="https://cdn.jsdelivr.net/npm/three@0.169.0/examples/fonts/helvetiker_regular.typeface.json"
            size={1.4 * S}
            height={0.4 * S}
            letterSpacing={0.01}
            bevelEnabled
            bevelSize={0.05 * S}
            bevelThickness={0.02 * S}
            bevelSegments={2}
          >
            FOR THOSE WHO [DIGDEEPER], 10% OFF
            <meshPhysicalMaterial
              color="#1A1A1C"
              metalness={1}
              roughness={0.55}
              envMapIntensity={0.8}
              side={DoubleSide}
              {...M_FILL}
            />
          </Text3D>
        </Center>
      </group>

      {/* ====== THE DRAWING — full technical drawing, mounted dark ======
          MorphRig fades the ink in across the drawing channel. The frame
          loops start at the powder coat's machined edge-catch level and grow
          into the structure tier. */}
      <BlueprintLines />
    </group>
  );
}

/**
 * 3D camera lens assembly:
 * 1. Machined barrel wall (CylinderGeometry, open-ended) — protrudes from housing
 * 2. Machined ring face (RingGeometry) — catches light at the top
 * 3. Dark lens glass (CircleGeometry) — recessed at barrel base
 * 4. Blue-purple coating ring — on glass surface
 * 5. Inner lens element ring — deeper recess for multi-element look
 */
function renderLens(
  x: number, y: number,
  barrelGeo: CylinderGeometry,
  ringFaceGeo: RingGeometry,
  lensGeo: CircleGeometry,
  coatingGeo: RingGeometry,
  innerGeo: RingGeometry,
) {
  // Z positions relative to camera group origin (z=0 = back glass surface)
  const housingFace = -CAM_BUMP_DEPTH - 0.005; // Outer face of camera housing
  const ringFace = housingFace - RING_PROTRUDE;  // Protruding ring face (closest to viewer)
  const barrelCenter = (housingFace + ringFace) / 2;
  const lensGlass = housingFace + 0.005;         // Lens glass slightly inside housing
  const coatingZ = lensGlass - 0.003;            // Coating on glass surface
  const innerElementZ = lensGlass - 0.008;       // Inner lens element, deeper

  return (
    <group key={`lens${x}${y}`} position={[x, y, 0]}>
      {/* Machined barrel wall — outer cylinder, open-ended */}
      <mesh geometry={barrelGeo} position={[0, 0, barrelCenter]} rotation={[Math.PI / 2, 0, 0]}>
        <meshPhysicalMaterial {...ringProps} {...M_FILL} />
      </mesh>

      {/* Machined ring face — flat annular cap at protruding end */}
      <mesh geometry={ringFaceGeo} position={[0, 0, ringFace]} rotation={[Math.PI, 0, 0]}>
        <meshPhysicalMaterial {...ringProps} {...M_FILL} />
      </mesh>

      {/* Camera lens glass — dielectric (not metal!), high-IOR optical glass (1.8).
          Iridescence simulates multi-layer anti-reflective coating (blue/purple shimmer). */}
      <mesh geometry={lensGeo} position={[0, 0, lensGlass]} rotation={[Math.PI, 0, 0]}>
        <meshPhysicalMaterial
          color="#0a0a18"
          metalness={0}
          roughness={0}
          ior={1.8}
          clearcoat={1}
          clearcoatRoughness={0}
          iridescence={0.3}
          iridescenceIOR={2.2}
          iridescenceThicknessRange={[100, 400]}
          reflectivity={0.8}
          envMapIntensity={2.0}
          {...M_FILL}
        />
      </mesh>

      {/* Lens coating — thin-film interference (iridescence) for anti-reflective shimmer */}
      <mesh geometry={coatingGeo} position={[0, 0, coatingZ]} rotation={[Math.PI, 0, 0]}>
        <meshPhysicalMaterial
          color="#15102A"
          metalness={0}
          roughness={0.05}
          iridescence={0.6}
          iridescenceIOR={2.2}
          iridescenceThicknessRange={[150, 500]}
          transparent opacity={0.45}
          envMapIntensity={1.0}
          {...M_DECAL}
        />
      </mesh>

      {/* Inner lens element — concentric ring for multi-element depth */}
      <mesh geometry={innerGeo} position={[0, 0, innerElementZ]} rotation={[Math.PI, 0, 0]}>
        <meshPhysicalMaterial
          color="#0A0A10" metalness={0} roughness={0.3}
          ior={1.5} side={DoubleSide}
          {...M_FILL}
        />
      </mesh>
    </group>
  );
}

// ============================================================
// SCREEN GLASS — real glass in the hero, perfect display in content
// ============================================================

/**
 * Jackson's glass route (2026-07-11): "real in hero, perfect in demo."
 * Hero state: full Gorilla-Glass clearcoat reflecting the SHAPED studio rig
 * (one clean gradient band, not env mush) with a CC0 fingerprint-smudge
 * clearcoatRoughness map — the pads break the band exactly where fingers
 * land. MorphRig drives clearcoat/env/reflectivity → 0 on the glass channel:
 * content phases show a zero-glare perfect display.
 *
 * clearcoatRoughness sits at 1 because three MULTIPLIES it with the map:
 * the map's near-black clean areas stay mirror-gloss, its gray pads rise
 * to soft-breakup roughness. Component form keeps useTexture inside
 * Suspense with hook-rules-clean setup via onLoad.
 */
function ScreenGlassMaterial() {
  // Configure in useTexture's onLoad — the sanctioned drei hook for texture
  // setup (render-scope mutation of a hook return trips react-hooks rules).
  const smudge = useTexture('/textures/screen-smudge.jpg', (t) => {
    t.colorSpace = LinearSRGBColorSpace; // roughness = data, not color
    t.wrapS = RepeatWrapping;
    t.wrapT = RepeatWrapping;
    t.needsUpdate = true;
  });

  return (
    <meshPhysicalMaterial
      color="#000000"
      metalness={0}
      roughness={0.05}
      clearcoat={1}
      clearcoatRoughness={1}
      clearcoatRoughnessMap={smudge}
      ior={1.52}
      reflectivity={0.5}
      envMapIntensity={1.15}
      toneMapped={false}
      userData={{ morphScreen: true }}
    />
  );
}

// ============================================================
// THE DRAWING — constructed contours, not mesh edges
// ============================================================
// A technical drawing draws *contours*: the machined edges a draftsman would
// ink, not the tessellation edges a mesh happens to have (EdgesGeometry on
// beveled extrusions yields either nothing or stair-step noise depending on
// threshold). Every loop below is built from the same rounded-rect shapes
// that build the geometry, so the lines sit exactly on the surfaces.

/** Line hierarchy — mirrors the text hierarchy: structure / detail / micro.
    Values run hot because 1px hairlines at dpr 2 lose ~half their energy to
    antialiasing — 0.85 on-screen reads like a crisp drafting pen, not a glow. */
const LINE_TIERS = {
  structure: 0.85,
  detail: 0.5,
  micro: 0.32,
} as const;
type LineTier = keyof typeof LINE_TIERS;

/** Rounded-rect contour in the XY plane at a fixed z */
function shapeLoopXY(w: number, h: number, r: number, z: number): BufferGeometry {
  const pts = rr(w, h, r).getPoints(16).map((p) => new Vector3(p.x, p.y, z));
  return new BufferGeometry().setFromPoints(pts);
}

/** Circle contour in the XY plane at a fixed z, centered on (cx, cy) */
function circleLoop(cx: number, cy: number, radius: number, z: number): BufferGeometry {
  const pts = new EllipseCurve(0, 0, radius, radius)
    .getPoints(48)
    .map((p) => new Vector3(cx + p.x, cy + p.y, z));
  return new BufferGeometry().setFromPoints(pts);
}

interface ContourLineProps {
  geometry: BufferGeometry;
  color: string;
  opacity: number;
  segments?: boolean;
  /** Mount at this opacity; MorphRig drives from → to (= `opacity`) across
      the ink window. */
  morphFrom: number;
}

function ContourLine({ geometry, color, opacity, segments = false, morphFrom }: ContourLineProps) {
  // toneMapped:false — tone mapping would crush a hairline's brightness;
  // ink must hit the framebuffer at face value, same as the screen texture.
  const material = (
    <lineBasicMaterial
      color={color}
      transparent
      opacity={morphFrom}
      depthWrite={false}
      toneMapped={false}
      userData={{ morphLine: { from: morphFrom, to: opacity } }}
    />
  );
  return segments ? (
    <lineSegments geometry={geometry}>{material}</lineSegments>
  ) : (
    <lineLoop geometry={geometry}>{material}</lineLoop>
  );
}

/** Ink color for the drawing — primary text tier, never accent */
const INK = '#EDEDED';

/** The powder coat's machined edge-catch opacity — the frame loops mount
    here (the solid body keeps a live edge highlight) and grow into the
    drawing's structure tier. */
const EDGE_CATCH_OPACITY = 0.45;

/**
 * The frame's machined-edge contours: one loop where the front chamfer meets
 * the side wall, one where the back chamfer meets it, plus a short vertical
 * edge at each corner apex joining the two loops — the cue that this is an
 * extruded slab, not a flat outline. Ticks are drawing-only cues (mount 0).
 */
function FrameContourLines() {
  const { front, back, ticks } = useMemo(() => {
    const zf = PHONE_DEPTH / 2 - BEVEL_THICKNESS;
    const zb = -PHONE_DEPTH / 2 + BEVEL_THICKNESS;

    // Corner apex — the 45° point of each corner arc, where the silhouette
    // turns: (hw − r + r/√2, hh − r + r/√2), mirrored to all four corners.
    const ax = PHONE_WIDTH / 2 - CORNER_RADIUS * (1 - Math.SQRT1_2);
    const ay = PHONE_HEIGHT / 2 - CORNER_RADIUS * (1 - Math.SQRT1_2);
    const tickPts: Vector3[] = [];
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        tickPts.push(new Vector3(sx * ax, sy * ay, zf), new Vector3(sx * ax, sy * ay, zb));
      }
    }

    return {
      front: shapeLoopXY(PHONE_WIDTH, PHONE_HEIGHT, CORNER_RADIUS, zf),
      back: shapeLoopXY(PHONE_WIDTH, PHONE_HEIGHT, CORNER_RADIUS, zb),
      ticks: new BufferGeometry().setFromPoints(tickPts),
    };
  }, []);

  return (
    <group>
      <ContourLine geometry={front} color={INK} opacity={LINE_TIERS.structure} morphFrom={EDGE_CATCH_OPACITY} />
      <ContourLine geometry={back} color={INK} opacity={LINE_TIERS.structure} morphFrom={EDGE_CATCH_OPACITY} />
      <ContourLine geometry={ticks} color={INK} opacity={LINE_TIERS.structure} segments morphFrom={0} />
    </group>
  );
}

/**
 * The full technical drawing. Structure tier carries the device silhouette
 * and screen; detail tier carries bezel, camera and buttons; micro tier
 * carries flash/LiDAR/port. The body's polygon-offset fills hide far-side
 * lines while solid and recede to occluder-black under the drawing, so the
 * resolved state reads hidden-line-removed, engineering-plate style.
 */
function BlueprintLines() {
  const geos = useMemo(() => {
    const gW = PHONE_WIDTH - FRAME_BAND * 2;
    const gH = PHONE_HEIGHT - FRAME_BAND * 2;
    const gCR = Math.max(CORNER_RADIUS - FRAME_BAND, 0);

    // Camera-local z planes (mirror renderLens math; camera group sits at
    // z = −PHONE_DEPTH/2 and extrudes toward −z after its PI rotation)
    const bumpFaceZ = -CAM_BUMP_DEPTH - 0.8 * S - 0.001; // extrude depth + bevel
    const housingFace = -CAM_BUMP_DEPTH - 0.005;
    const ringFaceZ = housingFace - RING_PROTRUDE - 0.001;
    const lensGlassZ = housingFace + 0.004;

    const lensXY: [number, number][] = [
      [CAM_SPACING / 2, CAM_SPACING / 2],
      [CAM_SPACING / 2, -CAM_SPACING / 2],
      [-CAM_SPACING / 2, 0],
    ];

    // Side buttons — silhouette loops on the outer button faces (YZ plane)
    const btnLoop = (xFace: number, cy: number, len: number): BufferGeometry => {
      const pts = rr(len, BTN_DEPTH_Z, 0.5 * S)
        .getPoints(8)
        .map((p) => new Vector3(xFace, cy + p.x, p.y));
      return new BufferGeometry().setFromPoints(pts);
    };
    const lx = -PHONE_WIDTH / 2 - BTN_PROTRUDE - 0.001;
    const rx = PHONE_WIDTH / 2 + BTN_PROTRUDE + 0.001;

    // USB-C port — bottom edge plane (XZ)
    const portPts = rr(7.0 * S, 1.6 * S, 0.5 * S)
      .getPoints(8)
      .map((p) => new Vector3(p.x, -PHONE_HEIGHT / 2 - 0.004, p.y));

    return {
      screen: shapeLoopXY(SCREEN_WIDTH, SCREEN_HEIGHT, SCREEN_CR, PHONE_DEPTH / 2 + 0.0015),
      glassFront: shapeLoopXY(gW, gH, gCR, PHONE_DEPTH / 2 + 0.0005),
      glassBack: shapeLoopXY(gW, gH, gCR, -PHONE_DEPTH / 2 - 0.0005),
      bump: shapeLoopXY(CAM_BUMP_SIZE, CAM_BUMP_SIZE, CAM_BUMP_CR, bumpFaceZ),
      barrels: lensXY.map(([x, y]) => circleLoop(x, y, CAM_RING_OUT, ringFaceZ)),
      lenses: lensXY.map(([x, y]) => circleLoop(x, y, CAM_LENS_R, lensGlassZ)),
      flash: circleLoop(-CAM_SPACING / 2, CAM_SPACING / 2, 1.3 * S, -CAM_BUMP_DEPTH - 0.003),
      lidar: circleLoop(-CAM_SPACING / 2, -CAM_SPACING / 2, 1.5 * S, -CAM_BUMP_DEPTH - 0.003),
      buttons: [
        btnLoop(lx, PHONE_HEIGHT / 2 - 34 * S, 5.5 * S),
        btnLoop(lx, PHONE_HEIGHT / 2 - 46 * S, 10 * S),
        btnLoop(lx, PHONE_HEIGHT / 2 - 60 * S, 10 * S),
        btnLoop(rx, PHONE_HEIGHT / 2 - 42 * S, 13 * S),
        btnLoop(rx, PHONE_HEIGHT / 2 - 85 * S, 7 * S),
      ],
      port: new BufferGeometry().setFromPoints(portPts),
    };
  }, []);

  const line = (geometry: BufferGeometry, tier: LineTier, key?: string) => (
    <ContourLine
      key={key}
      geometry={geometry}
      color={INK}
      opacity={LINE_TIERS[tier]}
      morphFrom={0}
    />
  );

  return (
    <group>
      {/* Device silhouette — structure tier */}
      <FrameContourLines />
      {line(geos.screen, 'structure')}

      {/* Bezel — detail tier */}
      {line(geos.glassFront, 'detail')}
      {line(geos.glassBack, 'detail')}

      {/* Camera module — drawn in the camera group's frame */}
      <group position={[CAM_X, CAM_Y, -PHONE_DEPTH / 2]}>
        {line(geos.bump, 'structure')}
        {geos.barrels.map((g, i) => line(g, 'detail', `barrel${i}`))}
        {geos.lenses.map((g, i) => line(g, 'micro', `lens${i}`))}
        {line(geos.flash, 'micro')}
        {line(geos.lidar, 'micro')}
      </group>

      {/* Buttons + port — detail/micro */}
      {geos.buttons.map((g, i) => line(g, 'detail', `btn${i}`))}
      {line(geos.port, 'micro')}
    </group>
  );
}

// ============================================================
// OPS MARK BADGE — the back badge
// ============================================================

/**
 * The OPS bracket mark, engraved-inlay style, where the Apple logo sits on
 * a consumer phone. Parsed from the canonical brand asset at runtime.
 * The mark is 180°-rotationally symmetric, so the double negative scale
 * (which corrects SVG y-down AND the back-face mirror from the PI rotation)
 * lands on the correct glyph.
 */
function OpsMarkBadge() {
  const { paths } = useLoader(SVGLoader, '/brand/ops-mark.svg');
  const geometries = useMemo(
    () =>
      paths
        .flatMap((path) => SVGLoader.createShapes(path))
        .map((shape) => new ShapeGeometry(shape)),
    [paths],
  );

  // Source viewBox is 2400×2400; match a consumer badge's 11mm visual height
  const k = (11.0 * S) / 2400;

  return (
    <group
      position={[0, -5 * S, -PHONE_DEPTH / 2 - 0.001]}
      rotation={[0, Math.PI, 0]}
      scale={[-k, -k, k]}
    >
      <group position={[-1200, -1200, 0]}>
        {geometries.map((geometry, i) => (
          <mesh key={i} geometry={geometry}>
            <meshPhysicalMaterial {...logoMat} side={DoubleSide} {...M_FILL} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
