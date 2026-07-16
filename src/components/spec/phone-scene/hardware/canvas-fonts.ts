/**
 * Canvas font registration for the SPEC phone screens.
 *
 * next/font hashes its family names, so ctx.font can never reach the fonts
 * the page loads — the canvas needs its own FontFace registrations under
 * stable family names. The platform scene registered Cake Mono only and let
 * Mohave/JetBrains Mono silently fall back to system faces; the SPEC screens
 * carry real body copy and real numbers, so all three brand families are
 * registered here from committed /public/fonts assets (latin-subset variable
 * woff2 — Mohave 300–700, JetBrains Mono 400–700, both OFL).
 *
 * Loaded once, before the first draw; on failure (or the 1500ms timeout)
 * drawing proceeds with the generic fallbacks declared in the font stacks —
 * the screens degrade, they never hang.
 */

let fontsPromise: Promise<void> | null = null;
let mapImage: HTMLImageElement | null = null;

/** Mapbox dark-style static tile backing the home screen's full-bleed map
 *  (public/dev/mapbox-dark.png — committed with the original hero build).
 *  Null until decoded — the home draw falls back to the flat canvas and
 *  self-heals on the next animated frame. */
export function getMapImage(): HTMLImageElement | null {
  return mapImage;
}

interface FaceSpec {
  family: string;
  url: string;
  weight: string;
  check: string;
}

const FACES: readonly FaceSpec[] = [
  {
    family: 'Cake Mono',
    url: '/fonts/CakeMono-Light.woff2',
    weight: '300',
    check: '300 53px "Cake Mono"',
  },
  {
    family: 'Mohave',
    url: '/fonts/Mohave-Variable.woff2',
    weight: '300 700',
    check: '400 30px "Mohave"',
  },
  {
    family: 'JetBrains Mono',
    url: '/fonts/JetBrainsMono-Variable.woff2',
    weight: '400 700',
    check: '400 24px "JetBrains Mono"',
  },
];

export function ensureCanvasFonts(): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve();
  if (!fontsPromise) {
    const faceLoads = FACES.map((spec) =>
      (async () => {
        if (document.fonts.check(spec.check)) return;
        const face = new FontFace(spec.family, `url(${spec.url}) format('woff2')`, {
          weight: spec.weight,
          style: 'normal',
          display: 'swap',
        });
        const loaded = await face.load();
        document.fonts.add(loaded);
      })().catch(() => {
        // Graceful degrade: this family renders in its stack fallback.
      }),
    );

    const mapLoad = (async () => {
      const img = new Image();
      img.src = '/dev/mapbox-dark.png';
      await img.decode();
      mapImage = img;
    })().catch(() => {
      // Graceful degrade: the home screen keeps its flat canvas.
    });

    // Never let a hung asset fetch stall the phone's first paint.
    fontsPromise = Promise.race([
      Promise.all([...faceLoads, mapLoad]).then(() => undefined),
      new Promise<void>((resolve) => {
        setTimeout(resolve, 1500);
      }),
    ]);
  }
  return fontsPromise;
}
