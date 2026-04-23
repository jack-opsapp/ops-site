/**
 * OPS Design Tokens — Single Source of Truth (spec v2, 2026-04-17)
 *
 * All design values live here. Tailwind theme (globals.css @theme) mirrors these.
 * Components reference this for Framer Motion configs and programmatic access.
 *
 * ops-site is marketing — it diverges intentionally from OPS-Web by retaining heavy
 * Mohave display type for hero moments. All other tokens (accent, text ladder, radii,
 * motion curve) follow the canonical spec.
 *
 * Canonical source: /.interface-design/system.md at the repo root.
 */

export const theme = {
  colors: {
    // Canvas — pure black, no off-black.
    background: '#000000',
    surface: '#0A0A0A',          // mid-grey panel surface (was #0D0D0D)
    surfaceElevated: '#141414',  // slightly lifted panel

    // Text ladder — all values WCAG AA verified against #000
    textPrimary: '#EDEDED',     // was #FFFFFF — never pure white
    textSecondary: '#B5B5B5',   // was #999999
    textTertiary: '#8A8A8A',    // new — labels / metadata / placeholders
    textMute: '#6A6A6A',        // decorative ONLY — // slashes, separators

    // Accent — primary CTA + focus ring ONLY
    accent: '#6F94B0',          // was #597794 — new steel blue

    // Earth tones — semantic only, never decorative
    olive: '#9DB582',           // success / completed / nominal / +delta
    tan: '#C4A868',             // attention / warning / site visit / expiring
    rose: '#B58289',            // error / overdue / cost
    brick: '#93321A',           // destructive borders/dots ONLY — never text on black

    // Financial
    finRevenue: '#C4A868',
    finProfit: '#9DB582',
    finCost: '#B58289',
    finReceivables: '#D4A574',
    finOverdue: '#93321A',

    // Borders & hairlines
    border: 'rgba(255, 255, 255, 0.10)',
    borderHover: 'rgba(255, 255, 255, 0.25)',
    glassBorder: 'rgba(255, 255, 255, 0.09)',

    // Surface tints
    surfaceInput: 'rgba(255, 255, 255, 0.04)',
    surfaceHoverTint: 'rgba(255, 255, 255, 0.05)',
    surfaceActive: 'rgba(255, 255, 255, 0.08)',

    // Glass (for marketing moments where blur makes sense)
    glass: 'rgba(18, 18, 20, 0.58)',
    glassDense: 'rgba(18, 18, 20, 0.78)',

    // Light-mode inversions (legal docs, print, light email templates)
    textDark: '#000000',
    backgroundLight: '#FFFFFF',
  },
  fonts: {
    // Mohave retained as marketing display voice — heavy weights (600/700) OK here.
    heading: 'var(--font-mohave)',
    body: 'var(--font-mohave)',

    // Former Kosugi roles moved to JetBrains Mono (tactical labels, numbers, //, [brackets])
    caption: 'var(--font-jetbrains-mono)',
    label: 'var(--font-jetbrains-mono)',
    mono: 'var(--font-jetbrains-mono)',

    // Cake Mono Light 300 — uppercase display voice for badges / section marks that want the
    // tactical-product character. Reserve for small-type UPPERCASE surfaces, not hero.
    cakemono: 'var(--font-cakemono)',
  },
  radius: {
    // Sharp — never consumer bubbles.
    sm: '2px',   // progress tracks
    md: '3px',   // small chips
    lg: '4px',   // tags, badges — matches spec chipRadius
    btn: '5px',  // buttons, inputs
    panel: '10px', // cards / panels
    modal: '12px', // modals, popovers, dropdowns, toasts
    sidebar: '6px', // sidebar hover background
  },
  spacing: {
    xs: '8px',
    sm: '16px',
    md: '24px',
    lg: '32px',
    xl: '48px',
    '2xl': '64px',
    '3xl': '96px',
    '4xl': '128px',
  },
  animation: {
    // Single authorized curve per spec — no spring physics, no bounce.
    easing: [0.22, 1, 0.36, 1] as const,
    durations: {
      hover: 0.15,
      panel: 0.20,
      page: 0.25,
      stagger: 0.30,
      flip: 0.35,
      countUp: 0.80,
    },
    fadeInUp: {
      initial: { opacity: 0, y: 20 },
      whileInView: { opacity: 1, y: 0 },
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
      viewport: { once: true, amount: 0.2 },
    },
  },
} as const;
