'use client';

/**
 * TailoredPhoneScene — R3F Canvas for the tailored page phone.
 *
 * Reuses PhoneModel from platform. Uses TailoredScreenRenderer for
 * scroll-phase-driven screen content.
 */

import { Suspense, useRef, useState, useCallback, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import PhoneModel from '@/components/platform/phone-scene/PhoneModel';
import PhoneEnvironment from '@/components/platform/phone-scene/PhoneEnvironment';
import { useAutoRotation } from '@/components/platform/phone-scene/useAutoRotation';
import { TailoredScreenRenderer } from './TailoredScreenRenderer';
import type { TailoredPhase } from './constants';
import type { Mesh } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';

interface TailoredPhoneSceneProps {
  isVisible: boolean;
  phase: TailoredPhase;
  tier: string | null;
}

function SceneContent({ isVisible, phase, tier }: TailoredPhoneSceneProps) {
  const [screenMesh, setScreenMesh] = useState<Mesh | null>(null);
  const rendererRef = useRef<TailoredScreenRenderer | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);

  const controlsRef = useRef<OrbitControlsImpl | null>(null) as React.MutableRefObject<OrbitControlsImpl | null>;
  const [controlsReady, setControlsReady] = useState(false);

  const controlsCallbackRef = useCallback((instance: OrbitControlsImpl | null) => {
    controlsRef.current = instance;
    setControlsReady(!!instance);
  }, []);

  const screenCallbackRef = useCallback((mesh: Mesh | null) => {
    setScreenMesh(mesh);
  }, []);

  // Init renderer and apply texture when screen mesh is ready
  useEffect(() => {
    if (!screenMesh) return;

    const renderer = new TailoredScreenRenderer();
    rendererRef.current = renderer;

    const texture = new THREE.CanvasTexture(renderer.getCanvas());
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    textureRef.current = texture;

    // Apply texture to screen mesh
    const mat = screenMesh.material as THREE.MeshStandardMaterial;
    mat.map = texture;
    mat.emissiveMap = texture;
    mat.emissive = new THREE.Color(1, 1, 1);
    mat.emissiveIntensity = 0.6;
    mat.needsUpdate = true;

    renderer.onFrame(() => {
      if (textureRef.current) textureRef.current.needsUpdate = true;
    });

    renderer.startInitialDraw();

    return () => {
      renderer.setPaused(true);
      texture.dispose();
    };
  }, [screenMesh]);

  // React to phase/tier changes
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      renderer.switchPhaseInstant(phase, tier);
    } else {
      renderer.switchPhase(phase, tier);
    }
  }, [phase, tier]);

  // Pause when not visible
  useEffect(() => {
    rendererRef.current?.setPaused(!isVisible);
  }, [isVisible]);

  // Auto-rotation
  useAutoRotation({
    controlsRef,
    controlsReady,
    isMobile: false,
    enabled: isVisible,
  });

  return (
    <>
      <PhoneEnvironment />
      <group>
        <PhoneModel screenRef={screenCallbackRef} />
      </group>
      <OrbitControls
        ref={controlsCallbackRef}
        enableZoom={false}
        enablePan={false}
        enableRotate={true}
        maxPolarAngle={Math.PI * 0.65}
        minPolarAngle={Math.PI * 0.35}
      />
    </>
  );
}

export default function TailoredPhoneScene({ isVisible, phase, tier }: TailoredPhoneSceneProps) {
  return (
    <Canvas
      frameloop={isVisible ? 'demand' : 'never'}
      camera={{ position: [0, 0, 5], fov: 35 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        <SceneContent isVisible={isVisible} phase={phase} tier={tier} />
      </Suspense>
    </Canvas>
  );
}
