'use client';

/**
 * PhoneEnvironment — Lighting and ground shadow for the 3D phone scene.
 *
 * No HDR environment map (wrong aesthetic, too heavy).
 * Single directional light + ambient + ContactShadows from drei.
 */

import { ContactShadows } from '@react-three/drei';

export default function PhoneEnvironment() {
  return (
    <>
      {/* Ambient light — ensures no edge disappears completely */}
      <ambientLight intensity={0.2} />

      {/* Main directional light — from upper-left to catch wireframe edges */}
      <directionalLight
        position={[-3, 4, 5]}
        intensity={0.4}
        color="#FFFFFF"
      />

      {/* Subtle fill light from the opposite side */}
      <directionalLight
        position={[2, 1, -3]}
        intensity={0.1}
        color="#597794" // Slight accent tint on fill
      />

      {/* Ground shadow — subtle, diffused, grounds the phone in space */}
      <ContactShadows
        position={[0, -2.2, 0]}
        opacity={0.25}
        scale={8}
        blur={2.5}
        far={4}
        color="#000000"
      />
    </>
  );
}
