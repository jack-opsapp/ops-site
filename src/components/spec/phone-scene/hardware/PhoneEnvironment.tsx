'use client';

/**
 * PhoneEnvironment — shaped dark-studio lighting rig.
 *
 * Vendored from the platform scene's approved hardware direction (Jackson's
 * "boring lighting" verdict, 2026-07-11 render review). Real product studios
 * light devices with big shaped panels: in glass they reflect as ONE clean
 * gradient band; on matte powder coat they model the form with broad
 * highlights. Lightformers bake into the env map — zero runtime cost. The
 * sunset easter egg stays as the map's base layer, demoted to ambience
 * (0.55) so the shaped light reads over it.
 *
 * The contact shadow rides the drawing channel: a full-weight ground shadow
 * under a hairline drawing reads wrong, so it eases 0.4 → 0.22 as the body
 * recedes. Driven imperatively on the drei internals — defensive traversal;
 * if drei's internals ever change shape this quietly no-ops and the shadow
 * simply stays at its mounted value.
 */

import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer } from '@react-three/drei';
import { bodyMix, type MorphChannel } from './morph-channel';
import type { Group, Material } from 'three';

const SHADOW_SOLID = 0.4;
const SHADOW_DRAWING = 0.22;

interface PhoneEnvironmentProps {
  /** Drawing-progress channel — eases the contact shadow with the body. */
  drawing?: MorphChannel;
}

export default function PhoneEnvironment({ drawing }: PhoneEnvironmentProps) {
  const invalidate = useThree((s) => s.invalidate);

  const shadowRef = useRef<Group>(null);
  useEffect(() => {
    if (!drawing) return;
    return drawing.subscribe((t) => {
      const group = shadowRef.current;
      if (!group) return;
      group.traverse((obj) => {
        const material = (obj as { material?: Material }).material;
        if (material && material.transparent && typeof material.opacity === 'number') {
          material.opacity = SHADOW_SOLID + (SHADOW_DRAWING - SHADOW_SOLID) * bodyMix(t);
        }
      });
      invalidate();
    });
  }, [drawing, invalidate]);

  // Lights are static — set once at mount. In `demand` frameloop mode the
  // scene only re-renders on invalidate(); request one explicit frame on
  // mount as a guard against a stale dark first frame.
  useEffect(() => {
    invalidate();
  }, [invalidate]);

  return (
    <>
      <Environment
        resolution={256}
        frames={1}
        files="/images/env-easter-egg.jpg"
        environmentIntensity={0.55}
        environmentRotation={[0, 3 * Math.PI / 2, 0]}
        background={false}
      >
        {/* KEY — big warm softbox, upper-left: the clean band in glass,
            broad form modeling on the coat */}
        <Lightformer form="rect" intensity={1.8} color="#ffeedd"
          scale-x={8} scale-y={4} position={[-4, 4, 4]} target={[0, 0, 0]} />
        {/* FILL — cool, dim, ~5:1 against key: drama, not flatness */}
        <Lightformer form="rect" intensity={0.35} color="#cfe0ee"
          scale-x={4} scale-y={2} position={[4, 2, 5]} target={[0, 0, 0]} />
        {/* RIM — hard cool slash behind-right: separates the
            murdered-out silhouette from the black canvas */}
        <Lightformer form="circle" intensity={3.5} color="#eef4fa"
          scale={2.5} position={[2.5, 4, -6]} target={[0, 0, 0]} />
        {/* EDGE STRIP — tall narrow former far left: continuous
            hairline catch down the long frame edge */}
        <Lightformer form="rect" intensity={1.2} color="#f4f1ea"
          scale-x={0.6} scale-y={7} position={[-7, 0, -1]} target={[0, 0, 0]} />
        {/* FLOOR BOUNCE — keeps the under-chin off pure black */}
        <Lightformer form="rect" intensity={0.25} color="#ffffff"
          scale-x={40} scale-y={1} position={[0, -2, 0]} rotation-x={Math.PI / 2} />
      </Environment>

      {/* Diffuse safety floor — the dielectric coat must never go
          information-black in cavities the formers miss. */}
      <ambientLight intensity={0.2} color="#f0ece6" />

      {/* Ground shadow — anchors the phone; opacity rides the drawing channel. */}
      <ContactShadows
        ref={shadowRef}
        position={[0, -2.2, 0]}
        opacity={SHADOW_SOLID}
        scale={10}
        blur={2.6}
        far={5}
        color="#000000"
      />
    </>
  );
}
