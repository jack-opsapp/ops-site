'use client';

/**
 * TailoredPhoneScene — R3F Canvas for the tailored page phone.
 *
 * Reuses PhoneModel + PhoneEnvironment from platform.
 * Uses TailoredScreenRenderer for scroll-phase-driven screen content.
 * Camera and setup matches PlatformHero's PhoneScene exactly.
 */

import { Suspense, useRef, useState, useCallback, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import PhoneModel from '@/components/platform/phone-scene/PhoneModel';
import PhoneEnvironment from '@/components/platform/phone-scene/PhoneEnvironment';
import { useAutoRotation } from '@/components/platform/phone-scene/useAutoRotation';
import { useReducedMotion } from '@/components/platform/phone-scene/useReducedMotion';
import { TailoredScreenRenderer } from './TailoredScreenRenderer';
import type { TailoredPhase } from './constants';
import type { Mesh, Group } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';

interface TailoredPhoneSceneProps {
  isVisible: boolean;
  phase: TailoredPhase;
  tier: string | null;
  isInHero: boolean;
}

/** Match platform PhoneScene exactly */
const BASE_ROTATION: [number, number, number] = [-0.48, 0.18, 0];
const RECOIL_STRENGTH = 0.035;
const RECOIL_LERP = 0.08;

/** Content-mode camera: settle to front-facing with slight off-angle */
const CONTENT_TARGET_AZIMUTH = 0.2; // ~11.5° off-center — tune visually
const CONTENT_TARGET_POLAR = 1.65; // more front-on (from initial ~1.97)
const SETTLE_LERP = 0.03; // smooth ~2s transition
const CONTENT_AZIMUTH_RANGE = 0.2; // ±~11.5° interaction range after settling

/** Content-mode phone orientation: more upright, facing viewer */
const CONTENT_ROTATION: [number, number, number] = [-0.12, 0.05, 0];
const CONTENT_SCALE = 0.92;
const ORIENTATION_LERP = 0.03; // matches settle speed

/** Find shortest rotation path between two angles */
function shortestAngleDiff(from: number, to: number): number {
  let diff = to - from;
  while (diff > Math.PI) diff -= 2 * Math.PI;
  while (diff < -Math.PI) diff += 2 * Math.PI;
  return diff;
}

function SceneContent({ isVisible, phase, tier, isInHero }: TailoredPhoneSceneProps) {
  const { invalidate } = useThree();
  const [screenMesh, setScreenMesh] = useState<Mesh | null>(null);
  const rendererRef = useRef<TailoredScreenRenderer | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const controlsRef = useRef<OrbitControlsImpl | null>(null) as React.MutableRefObject<OrbitControlsImpl | null>;
  const [controlsReady, setControlsReady] = useState(false);

  const controlsCallbackRef = useCallback((instance: OrbitControlsImpl | null) => {
    controlsRef.current = instance;
    setControlsReady(!!instance);
  }, []);

  const screenCallbackRef = useCallback((mesh: Mesh | null) => {
    setScreenMesh(mesh);
  }, []);

  // Phone group for cursor recoil + content-mode orientation
  const phoneGroupRef = useRef<Group>(null);
  const currentRecoil = useRef({ x: 0, y: 0 });
  const targetBaseRotation = useRef<[number, number, number]>([...BASE_ROTATION]);
  const currentScale = useRef(1.0);

  // Init renderer and apply texture when screen mesh is ready
  useEffect(() => {
    if (!screenMesh) return;

    const renderer = new TailoredScreenRenderer();
    rendererRef.current = renderer;

    const texture = new THREE.CanvasTexture(renderer.getCanvas());
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    textureRef.current = texture;

    const mat = screenMesh.material as THREE.MeshStandardMaterial;
    mat.map = texture;
    mat.emissiveMap = texture;
    mat.emissive = new THREE.Color(1, 1, 1);
    mat.emissiveIntensity = 0.6;
    mat.needsUpdate = true;

    renderer.onFrame(() => {
      if (textureRef.current) {
        textureRef.current.needsUpdate = true;
        invalidate();
      }
    });

    renderer.startInitialDraw();

    // Make phone visible after setup
    if (phoneGroupRef.current) {
      phoneGroupRef.current.visible = true;
    }

    return () => {
      renderer.setPaused(true);
      texture.dispose();
    };
  }, [screenMesh, invalidate]);

  // React to phase/tier changes
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    if (prefersReducedMotion) {
      renderer.switchPhaseInstant(phase, tier);
    } else {
      renderer.switchPhase(phase, tier);
    }
  }, [phase, tier, prefersReducedMotion]);

  // Pause when not visible
  useEffect(() => {
    rendererRef.current?.setPaused(!isVisible);
  }, [isVisible]);

  // Auto-rotation — only active in hero section
  useAutoRotation({
    controlsRef,
    controlsReady,
    isMobile: false,
    enabled: isVisible && !prefersReducedMotion && isInHero,
  });

  // Settle to front-facing angle when scrolling past hero
  const isSettled = useRef(false);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (!isInHero) {
      let needsUpdate = false;

      // Azimuthal settling (Y-axis orbit)
      const currentAzimuth = controls.getAzimuthalAngle();
      const azDiff = shortestAngleDiff(currentAzimuth, CONTENT_TARGET_AZIMUTH);
      if (Math.abs(azDiff) > 0.003) {
        controls.setAzimuthalAngle(currentAzimuth + azDiff * SETTLE_LERP);
        needsUpdate = true;
      }

      // Polar settling (X-axis orientation)
      const currentPolar = controls.getPolarAngle();
      const polDiff = CONTENT_TARGET_POLAR - currentPolar;
      if (Math.abs(polDiff) > 0.003) {
        controls.setPolarAngle(currentPolar + polDiff * SETTLE_LERP);
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

  // Cursor recoil + content-mode orientation & scale
  useFrame(() => {
    if (!phoneGroupRef.current) return;

    const targetRot = isInHero ? BASE_ROTATION : CONTENT_ROTATION;
    const targetScale = isInHero ? 1.0 : CONTENT_SCALE;
    let changed = false;

    // Lerp base rotation toward target mode
    for (let i = 0; i < 3; i++) {
      const diff = targetRot[i] - targetBaseRotation.current[i];
      if (Math.abs(diff) > 0.001) {
        targetBaseRotation.current[i] += diff * ORIENTATION_LERP;
        changed = true;
      }
    }

    // Lerp scale
    const scaleDiff = targetScale - currentScale.current;
    if (Math.abs(scaleDiff) > 0.001) {
      currentScale.current += scaleDiff * ORIENTATION_LERP;
      changed = true;
    }

    // Recoil decay
    currentRecoil.current.x += (0 - currentRecoil.current.x) * RECOIL_LERP;
    currentRecoil.current.y += (0 - currentRecoil.current.y) * RECOIL_LERP;

    // Apply rotation (base + recoil)
    phoneGroupRef.current.rotation.x = targetBaseRotation.current[0] + currentRecoil.current.x;
    phoneGroupRef.current.rotation.y = targetBaseRotation.current[1] + currentRecoil.current.y;
    phoneGroupRef.current.rotation.z = targetBaseRotation.current[2];

    // Apply scale
    const sc = currentScale.current;
    phoneGroupRef.current.scale.set(sc, sc, sc);

    if (changed) invalidate();
  });

  return (
    <>
      <group ref={phoneGroupRef} rotation={BASE_ROTATION} visible={false}>
        <PhoneModel screenRef={screenCallbackRef} />
        <PhoneEnvironment />
      </group>

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

export default function TailoredPhoneScene({ isVisible, phase, tier, isInHero }: TailoredPhoneSceneProps) {
  return (
    <Canvas
      frameloop={isVisible ? 'demand' : 'never'}
      camera={{
        position: [7.15, -3.01, 0.12],
        fov: 45,
        near: 0.1,
        far: 100,
      }}
      style={{ background: 'transparent' }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
    >
      <Suspense fallback={null}>
        <SceneContent isVisible={isVisible} phase={phase} tier={tier} isInHero={isInHero} />
      </Suspense>
    </Canvas>
  );
}
