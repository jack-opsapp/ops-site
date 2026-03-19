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
 * controlsRef typed as OrbitControlsImpl from three-stdlib — Sprint 4
 * needs this for auto-rotation speed interpolation.
 */

import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import PhoneModel from './PhoneModel';
import PhoneEnvironment from './PhoneEnvironment';
import PhoneInteraction from './PhoneInteraction';
import type { Mesh } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

/** Inner scene content — useThree must be called inside Canvas */
function PhoneSceneContent() {
  const screenRef = useRef<Mesh>(null);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const [screenMesh, setScreenMesh] = useState<Mesh | null>(null);
  const { invalidate } = useThree();

  // Capture the screen mesh ref after PhoneModel mounts so
  // PhoneInteraction can attach the CanvasTexture to it
  useEffect(() => {
    if (screenRef.current) {
      setScreenMesh(screenRef.current);
    }
  }, []);

  return (
    <>
      <PhoneModel screenRef={screenRef} />
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
      dpr={[1, 2]}
    >
      <Suspense fallback={null}>
        <PhoneSceneContent />
      </Suspense>
    </Canvas>
  );
}
