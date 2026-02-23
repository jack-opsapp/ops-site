/**
 * DataStream — Animated particles flowing through SVG paths
 * Overlays the PhoneWireframe with matching viewBox
 * Different flow patterns per variant
 */

'use client';

import { motion } from 'framer-motion';

interface DataStreamProps {
  isActive: boolean;
  variant: 'scheduling' | 'projects' | 'team';
}

interface Particle {
  id: number;
  delay: number;
  duration: number;
  radius: number;
  peakOpacity: number;
}

function createParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    delay: i * 0.3,
    duration: 2.5 + (i % 3) * 0.4,
    radius: 2 + (i % 2),
    peakOpacity: 0.2 + (i % 4) * 0.1,
  }));
}

/**
 * Scheduling: horizontal flow left-to-right along timeline rows
 */
function SchedulingStream({ isActive }: { isActive: boolean }) {
  const particles = createParticles(8);
  const rows = [108, 148, 198, 230, 310];

  return (
    <>
      {particles.map((p) => {
        const row = rows[p.id % rows.length];
        return (
          <motion.circle
            key={p.id}
            r={p.radius}
            fill="white"
            animate={
              isActive
                ? {
                    cx: [30, 110, 190],
                    cy: [row, row - 2 + (p.id % 3) * 2, row],
                    opacity: [0, p.peakOpacity, 0],
                  }
                : {
                    opacity: 0,
                  }
            }
            transition={
              isActive
                ? {
                    duration: p.duration,
                    delay: p.delay,
                    repeat: Infinity,
                    ease: 'linear',
                  }
                : { duration: 0.3 }
            }
          />
        );
      })}
    </>
  );
}

/**
 * Projects: vertical flow top-to-bottom through card stack
 */
function ProjectsStream({ isActive }: { isActive: boolean }) {
  const particles = createParticles(9);
  const columns = [60, 90, 120, 150];

  return (
    <>
      {particles.map((p) => {
        const col = columns[p.id % columns.length];
        return (
          <motion.circle
            key={p.id}
            r={p.radius}
            fill="white"
            animate={
              isActive
                ? {
                    cx: [col + (p.id % 3) * 2, col, col - (p.id % 3) * 2],
                    cy: [70, 210, 370],
                    opacity: [0, p.peakOpacity, 0],
                  }
                : {
                    opacity: 0,
                  }
            }
            transition={
              isActive
                ? {
                    duration: p.duration + 0.5,
                    delay: p.delay,
                    repeat: Infinity,
                    ease: 'linear',
                  }
                : { duration: 0.3 }
            }
          />
        );
      })}
    </>
  );
}

/**
 * Team: radial flow outward from center (network effect)
 */
function TeamStream({ isActive }: { isActive: boolean }) {
  const particles = createParticles(10);
  const centerX = 110;
  const centerY = 210;
  const angles = [0, 40, 80, 120, 160, 200, 240, 280, 320, 360];

  return (
    <>
      {particles.map((p) => {
        const angle = (angles[p.id % angles.length] * Math.PI) / 180;
        const endX = centerX + Math.cos(angle) * 80;
        const endY = centerY + Math.sin(angle) * 100;
        const midX = centerX + Math.cos(angle) * 40;
        const midY = centerY + Math.sin(angle) * 50;

        return (
          <motion.circle
            key={p.id}
            r={p.radius}
            fill="white"
            animate={
              isActive
                ? {
                    cx: [centerX, midX, endX],
                    cy: [centerY, midY, endY],
                    opacity: [0, p.peakOpacity, 0],
                  }
                : {
                    opacity: 0,
                  }
            }
            transition={
              isActive
                ? {
                    duration: p.duration,
                    delay: p.delay,
                    repeat: Infinity,
                    ease: 'linear',
                  }
                : { duration: 0.3 }
            }
          />
        );
      })}
    </>
  );
}

const streamVariants = {
  scheduling: SchedulingStream,
  projects: ProjectsStream,
  team: TeamStream,
};

export default function DataStream({ isActive, variant }: DataStreamProps) {
  const StreamContent = streamVariants[variant];

  return (
    <svg
      viewBox="0 0 220 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full pointer-events-none"
    >
      <StreamContent isActive={isActive} />
    </svg>
  );
}
