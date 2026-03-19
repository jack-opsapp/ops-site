'use client';

/**
 * PhoneScene — R3F Canvas wrapper for the 3D wireframe iPhone.
 *
 * This is the dynamic import target. It sets up the Three.js canvas,
 * camera, and renders the phone model + environment + interaction layer.
 *
 * frameloop switches between "demand" (visible) and "never" (off-screen)
 * via IntersectionObserver in PhoneSceneWrapper. Zero GPU work when static
 * or when scrolled out of view.
 */

import { Suspense, useRef, useState, useCallback, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import PhoneModel from './PhoneModel';
import PhoneEnvironment from './PhoneEnvironment';
import PhoneInteraction from './PhoneInteraction';
import { useAutoRotation } from './useAutoRotation';
import { useReducedMotion } from './useReducedMotion';
import type { Mesh } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface PhoneSceneContentProps {
  isVisible: boolean;
}

/** Inner scene content — useThree must be called inside Canvas */
function PhoneSceneContent({ isVisible }: PhoneSceneContentProps) {
  const [screenMesh, setScreenMesh] = useState<Mesh | null>(null);

  // Callback ref — fires when PhoneModel's screen mesh mounts/unmounts.
  const screenCallbackRef = useCallback((mesh: Mesh | null) => {
    setScreenMesh(mesh);
  }, []);

  // MutableRefObject so auto-rotation can write .current
  const controlsRef = useRef<OrbitControlsImpl | null>(
    null,
  ) as React.MutableRefObject<OrbitControlsImpl | null>;

  // State signal that flips when OrbitControls mounts, so useAutoRotation's
  // drag-tracking effect re-runs with a non-null controlsRef.current.
  const [controlsReady, setControlsReady] = useState(false);

  // Callback ref for OrbitControls — populates controlsRef AND signals readiness
  const controlsCallbackRef = useCallback((instance: OrbitControlsImpl | null) => {
    controlsRef.current = instance;
    setControlsReady(!!instance);
  }, []);

  const { invalidate } = useThree();

  const [isMobile, setIsMobile] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Auto-rotation: disabled when off-screen or when user prefers reduced motion
  useAutoRotation({
    controlsRef,
    controlsReady,
    isMobile,
    enabled: isVisible && !prefersReducedMotion,
  });

  return (
    <>
      {/* Phone tilted forward ~25° on X (top away, bottom toward camera)
          and rotated ~15° on Y so the side edge is visible. */}
      <group rotation={[-0.44, 0.26, 0]}>
      <PhoneModel screenRef={screenCallbackRef} />
      <PhoneEnvironment />

      {screenMesh && (
        <PhoneInteraction
          screenMesh={screenMesh}
          controlsRef={controlsRef}
          invalidate={invalidate}
          prefersReducedMotion={prefersReducedMotion}
          isVisible={isVisible}
        />
      )}
      </group>

      <OrbitControls
        ref={controlsCallbackRef}
        enabled={!isMobile}  // Disable drag-to-orbit on mobile (conflicts with page scroll)
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

interface PhoneSceneProps {
  isVisible?: boolean;
}

export default function PhoneScene({ isVisible = true }: PhoneSceneProps) {
  return (
    <Canvas
      frameloop={isVisible ? 'demand' : 'never'}
      camera={{
        position: [3.0, 1.5, 7.0],
        fov: 45,
        near: 0.1,
        far: 100,
      }}
      style={{ background: 'transparent' }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
    >
      <Suspense fallback={null}>
        <PhoneSceneContent isVisible={isVisible} />
      </Suspense>
    </Canvas>
  );
}
