/**
 * OPS Design Tokens — Single Source of Truth
 *
 * All design values live here. Tailwind theme (globals.css @theme) mirrors these.
 * Components reference this for Framer Motion configs and programmatic access.
 */

export const theme = {
  colors: {
    background: '#0A0A0A',
    surface: '#0D0D0D',
    surfaceElevated: '#141414',
    textPrimary: '#FFFFFF',
    textSecondary: '#999999',
    accent: '#597794',
    border: 'rgba(255, 255, 255, 0.10)',
    borderHover: 'rgba(255, 255, 255, 0.25)',
    textDark: '#1A1A1A',
    backgroundLight: '#FFFFFF',
  },
  fonts: {
    heading: 'var(--font-mohave)',
    body: 'var(--font-mohave)',
    caption: 'var(--font-kosugi)',
    label: 'var(--font-kosugi)',
  },
  radius: {
    sm: '2px',
    md: '3px',
    lg: '4px',
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
    easing: [0.22, 1, 0.36, 1] as const,
    springDefault: { stiffness: 120, damping: 18 },
    springSnappy: { stiffness: 200, damping: 15 },
    fadeInUp: {
      initial: { opacity: 0, y: 20 },
      whileInView: { opacity: 1, y: 0 },
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
      viewport: { once: true, amount: 0.2 },
    },
  },
} as const;
