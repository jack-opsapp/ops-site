'use client';

/**
 * PhoneEnvironment — Lighting, environment map, and ground shadow.
 *
 * Uses drei's <Environment> with a minimal preset for reflections on
 * MeshPhysicalMaterial (clearcoat, metalness). The preset is lightweight
 * (~50KB) and doesn't dominate the scene — just provides enough data for
 * subtle specular highlights on the glass body and camera lenses.
 */

import { ContactShadows, Environment } from '@react-three/drei';

export default function PhoneEnvironment() {
  return (
    <>
      {/* Environment map — provides reflection data for physical materials.
          "night" preset: dark, low-key — matches the OPS aesthetic.
          Only affects materials with envMapIntensity > 0. */}
      <Environment preset="night" />

      {/* Ambient light — base illumination so no surface goes fully black */}
      <ambientLight intensity={0.3} />

      {/* Key light — upper-left, catches edges and creates specular on glass */}
      <directionalLight
        position={[-4, 5, 6]}
        intensity={0.6}
        color="#FFFFFF"
      />

      {/* Fill light — softer, from the right, accent-tinted */}
      <directionalLight
        position={[3, 2, -4]}
        intensity={0.15}
        color="#597794"
      />

      {/* Rim light — from behind to outline the phone silhouette */}
      <directionalLight
        position={[0, 0, -6]}
        intensity={0.2}
        color="#FFFFFF"
      />

      {/* Ground shadow — subtle, diffused */}
      <ContactShadows
        position={[0, -2.2, 0]}
        opacity={0.3}
        scale={10}
        blur={2.5}
        far={5}
        color="#000000"
      />
    </>
  );
}
