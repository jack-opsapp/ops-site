'use client';

/**
 * PhoneScene — R3F Canvas wrapper for the 3D wireframe iPhone.
 *
 * This is the dynamic import target. It sets up the Three.js canvas,
 * camera, and renders the phone model + environment.
 *
 * Sprint 2: Basic scene with placeholder screen.
 * Sprint 3: Canvas texture + tab interaction wired in.
 * Sprint 4: Auto-rotation, hover, mobile adaptation, polish.
 */

import { Suspense, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import PhoneModel from './PhoneModel';
import PhoneEnvironment from './PhoneEnvironment';
import type { Mesh } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

/** Inner scene — useThree must be called inside Canvas */
function Scene() {
  const screenRef = useRef<Mesh>(null);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { invalidate } = useThree();

  return (
    <>
      <PhoneModel screenRef={screenRef} />
      <PhoneEnvironment />

      {/* Orbit controls — constrained per design spec.
          controlsRef exposed for Sprint 4 auto-rotation.
          onChange triggers re-render in demand frameloop mode. */}
      <OrbitControls
        ref={controlsRef}
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 6}     // 30 degrees
        maxPolarAngle={Math.PI * 4 / 9} // 80 degrees
        minAzimuthAngle={-Math.PI / 2}  // -90 degrees
        maxAzimuthAngle={Math.PI / 2}   // 90 degrees
        dampingFactor={0.08}
        enableDamping
        target={[0, 0, 0]}
        onChange={() => invalidate()}
      />
    </>
  );
}

export default function PhoneScene() {
  return (
    <Canvas
      frameloop="demand"
      camera={{
        position: [1.5, 1.0, 3.5],
        fov: 45,
        near: 0.1,
        far: 100,
      }}
      style={{ background: 'transparent' }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]} // Clamp DPR to max 2 for performance
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}
