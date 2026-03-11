// src/lib/industries.ts

// --- Types ---

export type FlowDirection = 'left-to-right' | 'top-to-bottom' | 'right-to-left';
export type WireframeVariant = 'messages' | 'dashboard' | 'apps';

export interface IndustryContent {
  meta: {
    title: string;
    description: string;
    keywords: string[];
  };
  hero: {
    sectionLabel: string;
    headline: string;
    subtext: string;
  };
  painPoints: Array<{
    title: string;
    bullets: string[];
    forLine: string;
  }>;
  solutions: Array<{
    title: string;
    copy: string;
    painPointRef: number;
  }>;
  comparison: {
    competitors: [string, string];
    rows: Array<{
      feature: string;
      ops: boolean | string;
      comp1: boolean | string;
      comp2: boolean | string;
    }>;
  };
  faq: Array<{
    question: string;
    answer: string;
  }>;
  cta: {
    headline: string;
    subtext: string;
  };
}

export interface IndustryData {
  slug: string;
  name: string;
  painPointConfig: Array<{
    variant: WireframeVariant;
    flowDirection: FlowDirection;
  }>;
  content: {
    en: IndustryContent;
    es?: IndustryContent;
  };
}

// --- Universal FAQ (shared across all industries) ---

export const universalFAQ: { en: Array<{ question: string; answer: string }>; es: Array<{ question: string; answer: string }> } = {
  en: [
    {
      question: 'What does OPS cost?',
      answer: 'OPS is free to get started with full access to core features including scheduling, crew management, and project tracking. No credit card required. Paid plans unlock advanced features like analytics and priority support.',
    },
    {
      question: 'How do I get started with OPS?',
      answer: 'Download OPS from the App Store, create your account in under a minute, and start adding jobs immediately. No training required — your crew opens the app and knows what to do.',
    },
    {
      question: 'What devices does OPS work on?',
      answer: 'OPS is available on iPhone and iPad with an Android version in development. The app works offline so your crew can use it on job sites with no cell signal.',
    },
  ],
  es: [
    {
      question: '¿Cuánto cuesta OPS?',
      answer: 'OPS es gratis para comenzar con acceso completo a funciones principales. No se requiere tarjeta de crédito. Los planes pagados desbloquean funciones avanzadas.',
    },
    {
      question: '¿Cómo empiezo con OPS?',
      answer: 'Descarga OPS desde la App Store, crea tu cuenta en menos de un minuto y comienza a agregar trabajos de inmediato. Sin necesidad de entrenamiento.',
    },
    {
      question: '¿En qué dispositivos funciona OPS?',
      answer: 'OPS está disponible en iPhone y iPad con una versión de Android en desarrollo. La app funciona sin conexión.',
    },
  ],
};

// --- Industry Data ---
// POC industries populated after keyword research

export const industries: IndustryData[] = [];

// --- Helpers ---

export function getIndustryBySlug(slug: string): IndustryData | undefined {
  return industries.find((i) => i.slug === slug);
}

export function getAllIndustrySlugs(): string[] {
  return industries.map((i) => i.slug);
}
