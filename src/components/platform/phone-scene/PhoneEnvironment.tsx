'use client';

/**
 * PhoneEnvironment — Product photography lighting rig.
 *
 * Two lighting systems work together:
 *   1. Lightformers (env map) — control what shows up in reflections on
 *      glass/metal. Zero runtime cost. These are the primary "look" drivers.
 *   2. Direct lights — provide surface illumination, reveal anisotropy
 *      on titanium, and create soft diffuse shading across the body.
 *
 * Philosophy: warm/cool split. Key light is warm (late afternoon sun feel),
 * fill and environment lean cool (steel blue). This color temperature contrast
 * creates visual depth and makes the Black Titanium feel premium.
 */

import { useMemo } from 'react';
import { ContactShadows, Environment, Lightformer, useTexture } from '@react-three/drei';
import { SRGBColorSpace, CanvasTexture } from 'three';

export default function PhoneEnvironment() {
  return (
    <>
      {/* ================================================================
          ENVIRONMENT MAP — Lightformers for reflections
          Warm key from upper-left, cool fill from lower-right.
          Asymmetric placement creates diagonal gradient sweep on glass.
          ================================================================ */}
      <Environment files="/images/env-hdri.exr" resolution={512} background={false} environmentIntensity={1.0}>
        {/* Easter egg — only visible in reflections at the right angle */}
        <EasterEggPlane />
      </Environment>

      {/* ================================================================
          DIRECT LIGHTS — Minimal. Diffuse-first approach.
          The Lightformers above do 90% of the work through env reflections.
          One soft ambient + one gentle directional just for subtle shading
          gradient so surfaces aren't completely flat.
          ================================================================ */}

      {/* Ambient — primary surface illumination. Higher than before because
          we're not relying on directional lights anymore. */}
      <ambientLight intensity={0.3} color="#f0ece6" />

      {/* Soft directional from above — creates subtle shading gradient
          across the phone body so it reads as 3D. */}
      <directionalLight
        position={[-3, 5, 4]}
        intensity={0.15}
        color="#f8f0e4"
      />

      {/* Soft directional from front-below — comes from the viewer's
          direction but angled up to catch the bottom of the phone. */}
      <directionalLight
        position={[0, 2, 6]}
        intensity={0.12}
        color="#e8e0d4"
      />

      {/* Ground shadow — subtle, diffused */}
      <ContactShadows
        position={[0, -2.2, 0]}
        opacity={0.25}
        scale={10}
        blur={3}
        far={5}
        color="#000000"
      />
    </>
  );
}

/** Hidden image baked into the environment map — only visible as a faint
 *  ghost in reflections when the phone is orbited to the right angle.
 *  Draws the source image onto an offscreen canvas with radial feathered
 *  edges so it dissolves smoothly into the surrounding environment. */
function EasterEggPlane() {
  const srcTexture = useTexture('/images/env-easter-egg.jpg');

  const maskedTexture = useMemo(() => {
    const img = srcTexture.image as HTMLImageElement;
    if (!img || !img.width) return srcTexture;

    const w = img.width;
    const h = img.height;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return srcTexture;

    // Draw the source image
    ctx.drawImage(img, 0, 0);

    // Apply radial gradient mask — feathers edges to transparent
    ctx.globalCompositeOperation = 'destination-in';
    const cx = w / 2, cy = h / 2;
    const radius = Math.max(cx, cy);
    const grad = ctx.createRadialGradient(cx, cy, radius * 0.3, cx, cy, radius);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.7, 'rgba(255,255,255,0.6)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const tex = new CanvasTexture(canvas);
    tex.colorSpace = SRGBColorSpace;
    return tex;
  }, [srcTexture]);

  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[4, 32, 32]} />
      <meshBasicMaterial map={maskedTexture} side={2} toneMapped={false} />
    </mesh>
  );
}
