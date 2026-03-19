'use client';

/**
 * PhoneScene — R3F Canvas wrapper for the 3D wireframe iPhone.
 *
 * This is the dynamic import target. It sets up the Three.js canvas,
 * camera, and renders the phone model + environment + interaction layer.
 *
 * frameloop="demand" — only re-renders when invalidated (texture update,
 * orbit drag, auto-rotation). Zero GPU work when static.
 *
 * controlsRef typed as MutableRefObject<OrbitControlsImpl> — Sprint 4
 * needs to write .current for auto-rotation speed interpolation.
 */

import { Suspense, useRef, useState, useCallback, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import PhoneModel from './PhoneModel';
import PhoneEnvironment from './PhoneEnvironment';
import PhoneInteraction from './PhoneInteraction';
import { useAutoRotation } from './useAutoRotation';
import type { Mesh } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

/** Inner scene content — useThree must be called inside Canvas */
function PhoneSceneContent() {
  const [screenMesh, setScreenMesh] = useState<Mesh | null>(null);

  // Callback ref — fires when PhoneModel's screen mesh mounts/unmounts.
  // No race with Suspense: React guarantees the callback fires after the
  // DOM node is attached, regardless of when rendering completes.
  const screenCallbackRef = useCallback((mesh: Mesh | null) => {
    setScreenMesh(mesh);
  }, []);

  // MutableRefObject so auto-rotation can write .current
  const controlsRef = useRef<OrbitControlsImpl | null>(
    null,
  ) as React.MutableRefObject<OrbitControlsImpl | null>;

  const { invalidate } = useThree();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useAutoRotation({
    controlsRef,
    isMobile,
    enabled: true, // Will be wired to intersection observer visibility in Task 4.4
  });

  return (
    <>
      <PhoneModel screenRef={screenCallbackRef} />
      <PhoneEnvironment />

      {screenMesh && (
        <PhoneInteraction
          screenMesh={screenMesh}
          controlsRef={controlsRef}
          invalidate={invalidate}
        />
      )}

      <OrbitControls
        ref={controlsRef}
        enabled={!isMobile}  // Disable drag-to-orbit on mobile (conflicts with page scroll)
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 6}       // 30 degrees
        maxPolarAngle={(Math.PI * 4) / 9}  // 80 degrees
        minAzimuthAngle={-Math.PI / 2}     // -90 degrees
        maxAzimuthAngle={Math.PI / 2}      // 90 degrees
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
        position: [1.5, 1.0, 3.5],
        fov: 45,
        near: 0.1,
        far: 100,
      }}
      style={{ background: 'transparent' }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
    >
      <Suspense fallback={null}>
        <PhoneSceneContent />
      </Suspense>
    </Canvas>
  );
}
