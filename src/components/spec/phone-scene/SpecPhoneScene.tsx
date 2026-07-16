'use client';

/**
 * SpecPhoneScene — R3F Canvas for the /spec page phone.
 *
 * The newest OPS phone hardware (powder-coat solid, shaped dark-studio rig,
 * smudged glass, drawing linework — vendored under ./hardware) driven by the
 * spec page's phase choreography:
 *
 *   hero        — cinematic intro, auto-rotation, drag-to-orbit, real glass
 *   content     — settles front-on; the screen is the story (glass sheds)
 *   'building'  — the hardware resolves into its own engineering drawing
 *                 while the screen reports the SPEC-03 build
 *   'custom'    — back to solid, the finished tier deliverable on screen
 *
 * frameloop switches between "demand" (visible) and "never" (off-screen).
 * Zero GPU work when static or scrolled away.
 */

import { Suspense, useRef, useState, useCallback, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { NeutralToneMapping } from 'three';
import PhoneModel from './hardware/PhoneModel';
import PhoneEnvironment from './hardware/PhoneEnvironment';
import MorphRig from './hardware/MorphRig';
import { createMorphChannel, type MorphChannel } from './hardware/morph-channel';
import { useAutoRotation } from './hardware/useAutoRotation';
import { useReducedMotion } from './hardware/useReducedMotion';
import SpecPhoneInteraction from './SpecPhoneInteraction';
import type { SpecPhase, SpecTierId } from './constants';
import type { Mesh, Group } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface SpecPhoneSceneProps {
  isVisible: boolean;
  phase: SpecPhase;
  tier: SpecTierId | null;
  isInHero: boolean;
}

// --- Hero pose (matches the platform hero's product-shot recline) ---
const BASE_ROTATION: [number, number, number] = [-0.48, 0.18, 0];
// --- Content pose: near-upright, facing the reader — the screen is the story ---
const CONTENT_ROTATION: [number, number, number] = [-0.12, 0.05, 0];
const CONTENT_SCALE = 0.92;
const RECOIL_STRENGTH = 0.035; // Max radians of cursor recoil (~2°)
const RECOIL_LERP = 0.08;

// Content-mode camera: front-facing with a slight off-angle — frontal enough
// to read, angled enough to keep the env sun's reflection off the glass.
const CONTENT_TARGET_AZIMUTH = 0.2;
const CONTENT_TARGET_POLAR = 1.65;
const SETTLE_LERP = 0.03;
const CONTENT_AZIMUTH_RANGE = 0.2; // ±~11.5° drag range after settling

// --- Intro: ease from reveal angle to the hero rest pose (2.5s) ---
const INTRO_START = { az: 1.554, pol: 1.969 };
const INTRO_END = { az: 0.753, pol: 1.75 };
const INTRO_DURATION = 2.5;

/** Find shortest rotation path between two angles */
function shortestAngleDiff(from: number, to: number): number {
  let diff = to - from;
  while (diff > Math.PI) diff -= 2 * Math.PI;
  while (diff < -Math.PI) diff += 2 * Math.PI;
  return diff;
}

/**
 * SpecPhaseRig — converges the two morph scalars toward their phase targets
 * and publishes them. Exponential convergence IS the easing (ease-out by
 * nature, frame-rate normalized); the channels' ramp windows shape the rest.
 * Reduced motion snaps — the drawing and the glass handoff become cuts.
 */
function SpecPhaseRig({
  phase,
  isInHero,
  drawing,
  glass,
  prefersReducedMotion,
}: {
  phase: SpecPhase;
  isInHero: boolean;
  drawing: MorphChannel;
  glass: MorphChannel;
  prefersReducedMotion: boolean;
}) {
  const invalidate = useThree((s) => s.invalidate);
  const current = useRef({ drawing: 0, glass: 0 });

  const drawingTarget = phase === 'building' ? 1 : 0;
  const glassTarget = isInHero ? 0 : 1;

  // Demand-mode kick: a target change must wake the frame loop.
  useEffect(() => {
    invalidate();
  }, [drawingTarget, glassTarget, invalidate]);

  useFrame((_, delta) => {
    const c = current.current;
    let moving = false;

    // Per-frame convergence rates at a 60fps reference, normalized by delta:
    // k = 1 − (1 − rate)^(60·Δt). Drawing resolves statelier (~1.8s tail),
    // the glass handoff is quicker (~1s) — the screen must read promptly.
    const step = (value: number, target: number, rate: number): number => {
      if (prefersReducedMotion) return target;
      const k = 1 - Math.pow(1 - rate, 60 * delta);
      const next = value + (target - value) * k;
      // Land exactly once within half a thousandth — publishers skip no-ops.
      return Math.abs(target - next) < 0.0005 ? target : next;
    };

    const nextDrawing = step(c.drawing, drawingTarget, 0.035);
    if (nextDrawing !== c.drawing) {
      c.drawing = nextDrawing;
      drawing.publish(nextDrawing);
      moving = true;
    }

    const nextGlass = step(c.glass, glassTarget, 0.06);
    if (nextGlass !== c.glass) {
      c.glass = nextGlass;
      glass.publish(nextGlass);
      moving = true;
    }

    if (moving) invalidate();
  });

  return null;
}

function SceneContent({ isVisible, phase, tier, isInHero }: SpecPhoneSceneProps) {
  const { invalidate } = useThree();
  const [screenMesh, setScreenMesh] = useState<Mesh | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Channels — stable for the scene's lifetime
  const [drawing] = useState(() => createMorphChannel());
  const [glass] = useState(() => createMorphChannel());

  const controlsRef = useRef<OrbitControlsImpl | null>(
    null,
  ) as React.MutableRefObject<OrbitControlsImpl | null>;
  const [controlsInstance, setControlsInstance] = useState<OrbitControlsImpl | null>(null);

  const controlsCallbackRef = useCallback((instance: OrbitControlsImpl | null) => {
    controlsRef.current = instance;
    setControlsInstance(instance);
  }, []);

  const screenCallbackRef = useCallback((mesh: Mesh | null) => {
    setScreenMesh(mesh);
  }, []);

  const phoneGroupRef = useRef<Group>(null);
  const [isHoveringPhone, setIsHoveringPhone] = useState(false);

  // Demand-mode wake. invalidate() during frameloop='never' is dropped, so a
  // page state that changed while the phone was scrolled away (phase flip,
  // pose target, a canvas transition that finished unwatched) leaves nothing
  // to request the next frame when visibility returns — the scene would
  // freeze on its last rendered frame. One explicit kick per state change
  // renders a frame; the convergence loops self-sustain from there.
  useEffect(() => {
    if (isVisible) invalidate();
  }, [isVisible, phase, tier, isInHero, invalidate]);

  // --- Intro: ease from reveal angle to hero rest. Reduced motion snaps;
  // arriving mid-page (content already owns the phone) skips the cinematic —
  // one pose owner at a time. ---
  const introElapsed = useRef(0);
  const introStarted = useRef(false);
  const [introComplete, setIntroComplete] = useState(false);

  // Ease-in-out cubic
  const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  useFrame((_, delta) => {
    if (introComplete || !controlsRef.current) return;
    const controls = controlsRef.current;

    if (prefersReducedMotion || !isInHero) {
      if (phoneGroupRef.current) phoneGroupRef.current.visible = true;
      controls.setAzimuthalAngle(INTRO_END.az);
      controls.setPolarAngle(INTRO_END.pol);
      controls.update();
      introStarted.current = true;
      setIntroComplete(true);
      invalidate();
      return;
    }

    // Make phone visible on first animation frame (prevents a flash of the
    // unlit model before the first orbit write)
    if (!introStarted.current && phoneGroupRef.current) {
      phoneGroupRef.current.visible = true;
      introStarted.current = true;
    }

    introElapsed.current += delta;
    const rawT = Math.min(1, introElapsed.current / INTRO_DURATION);
    const t = easeInOut(rawT);

    controls.setAzimuthalAngle(INTRO_START.az + (INTRO_END.az - INTRO_START.az) * t);
    controls.setPolarAngle(INTRO_START.pol + (INTRO_END.pol - INTRO_START.pol) * t);
    controls.update();
    invalidate();

    if (rawT >= 1) setIntroComplete(true);
  });

  // Auto-rotation — hero only, after the intro lands
  useAutoRotation({
    controlsRef,
    controlsInstance,
    isMobile: false,
    enabled: isVisible && !prefersReducedMotion && introComplete && isInHero,
    isHoveringPhone,
  });

  // --- Content settle: converge the orbit to the front-facing angle when
  // the page's content owns the phone; release the clamps back in the hero.
  const isSettled = useRef(false);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls || !introComplete) return;

    if (!isInHero) {
      let needsUpdate = false;
      const k = prefersReducedMotion ? 1 : SETTLE_LERP;

      const currentAzimuth = controls.getAzimuthalAngle();
      const azDiff = shortestAngleDiff(currentAzimuth, CONTENT_TARGET_AZIMUTH);
      if (Math.abs(azDiff) > 0.003) {
        controls.setAzimuthalAngle(currentAzimuth + azDiff * k);
        needsUpdate = true;
      }

      const currentPolar = controls.getPolarAngle();
      const polDiff = CONTENT_TARGET_POLAR - currentPolar;
      if (Math.abs(polDiff) > 0.003) {
        controls.setPolarAngle(currentPolar + polDiff * k);
        needsUpdate = true;
      }

      if (needsUpdate) {
        controls.update();
        invalidate();
        isSettled.current = false;
      } else if (!isSettled.current) {
        controls.minAzimuthAngle = CONTENT_TARGET_AZIMUTH - CONTENT_AZIMUTH_RANGE;
        controls.maxAzimuthAngle = CONTENT_TARGET_AZIMUTH + CONTENT_AZIMUTH_RANGE;
        isSettled.current = true;
      }
    } else if (isSettled.current) {
      controls.minAzimuthAngle = -Infinity;
      controls.maxAzimuthAngle = Infinity;
      isSettled.current = false;
    }
  });

  // --- Cursor recoil + hero ↔ content orientation & scale convergence ---
  const cursorOffsetRef = useRef<{ x: number; y: number } | null>(null);
  const currentRecoil = useRef({ x: 0, y: 0 });
  const currentBase = useRef<[number, number, number]>([...BASE_ROTATION]);
  const currentScale = useRef(1.0);

  const handleCursorOffset = useCallback((offset: { x: number; y: number } | null) => {
    cursorOffsetRef.current = offset;
  }, []);

  useFrame(() => {
    if (!phoneGroupRef.current) return;

    const targetRot = isInHero ? BASE_ROTATION : CONTENT_ROTATION;
    const targetScale = isInHero ? 1.0 : CONTENT_SCALE;
    const k = prefersReducedMotion ? 1 : 0.06;
    let changed = false;

    for (let i = 0; i < 3; i++) {
      const diff = targetRot[i] - currentBase.current[i];
      if (Math.abs(diff) > 0.001) {
        currentBase.current[i] += diff * k;
        changed = true;
      }
    }

    const scaleDiff = targetScale - currentScale.current;
    if (Math.abs(scaleDiff) > 0.001) {
      currentScale.current += scaleDiff * k;
      changed = true;
    }

    // Recoil follows the cursor, decays to rest
    const recoilTarget = cursorOffsetRef.current
      ? {
          x: -cursorOffsetRef.current.y * RECOIL_STRENGTH,
          y: cursorOffsetRef.current.x * RECOIL_STRENGTH,
        }
      : { x: 0, y: 0 };
    currentRecoil.current.x += (recoilTarget.x - currentRecoil.current.x) * RECOIL_LERP;
    currentRecoil.current.y += (recoilTarget.y - currentRecoil.current.y) * RECOIL_LERP;

    phoneGroupRef.current.rotation.x = currentBase.current[0] + currentRecoil.current.x;
    phoneGroupRef.current.rotation.y = currentBase.current[1] + currentRecoil.current.y;
    phoneGroupRef.current.rotation.z = currentBase.current[2];

    const sc = currentScale.current;
    phoneGroupRef.current.scale.set(sc, sc, sc);

    if (
      changed ||
      Math.abs(currentRecoil.current.x) > 0.0005 ||
      Math.abs(currentRecoil.current.y) > 0.0005
    ) {
      invalidate();
    }
  });

  return (
    <>
      <group ref={phoneGroupRef} rotation={BASE_ROTATION} visible={false}>
        <PhoneModel screenRef={screenCallbackRef} />
        <PhoneEnvironment drawing={drawing} />
        <MorphRig drawing={drawing} glass={glass} phoneGroupRef={phoneGroupRef} />

        {screenMesh && (
          <SpecPhoneInteraction
            screenMesh={screenMesh}
            invalidate={invalidate}
            prefersReducedMotion={prefersReducedMotion}
            isVisible={isVisible}
            phase={phase}
            tier={tier}
            onHoverChange={setIsHoveringPhone}
            onCursorOffset={handleCursorOffset}
          />
        )}
      </group>

      <SpecPhaseRig
        phase={phase}
        isInHero={isInHero}
        drawing={drawing}
        glass={glass}
        prefersReducedMotion={prefersReducedMotion}
      />

      <OrbitControls
        ref={controlsCallbackRef}
        enableZoom={false}
        enablePan={false}
        dampingFactor={0.08}
        enableDamping
        target={[0, 0, 0]}
        onChange={() => invalidate()}
      />
    </>
  );
}

export default function SpecPhoneScene({ isVisible, phase, tier, isInHero }: SpecPhoneSceneProps) {
  return (
    <Canvas
      frameloop={isVisible ? 'demand' : 'never'}
      camera={{
        // Radius 7.18 — the platform hero's tightened product-shot framing.
        // The intro animates azimuth/polar via setAzimuthalAngle/setPolarAngle,
        // which preserve this radius.
        position: [6.62, -2.787, 0.111],
        fov: 45,
        near: 0.1,
        far: 100,
      }}
      style={{ background: 'transparent' }}
      // NEUTRAL tone curve — built for product shots embedded in 2D pages
      // (color-accurate, no filmic hue shift). The powder-coat pipeline was
      // tuned under it.
      gl={{ alpha: true, antialias: true, toneMapping: NeutralToneMapping }}
      dpr={[1, 2]}
    >
      <Suspense fallback={null}>
        <SceneContent isVisible={isVisible} phase={phase} tier={tier} isInHero={isInHero} />
      </Suspense>
    </Canvas>
  );
}
