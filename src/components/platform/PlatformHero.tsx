/**
 * PlatformHero — Full-viewport hero for the Platform page.
 * Left: headline copy (server-rendered).
 * Right: 3D interactive wireframe iPhone (client, dynamic import).
 */

import { SectionLabel, GradientOverlay } from '@/components/ui';
import { getTDict } from '@/i18n/server';
import PhoneSceneWrapper from './phone-scene/PhoneSceneWrapper';

export default async function PlatformHero() {
  const dict = await getTDict('platform');
  const t = (key: string) => {
    const value = dict[key];
    return typeof value === 'string' ? value : key;
  };

  return (
    <section className="relative min-h-screen w-full overflow-clip bg-ops-background">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#111111] via-ops-background to-[#050508]" />
      <div className="absolute inset-0 bg-gradient-to-tr from-[#0A0A0A] via-transparent to-[#0D1117]/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0E14]/20 to-ops-background/90" />

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
          backgroundSize: '256px 256px',
        }}
        aria-hidden="true"
      />

      <GradientOverlay direction="to-bottom" opacity={0.7} />

      {/* Content layout:
          Phone is ALWAYS absolutely positioned — never affects text flow.
          Desktop: phone right-aligned, text left with z-priority. As viewport
          narrows, phone naturally slides behind text.
          Mobile (<lg): phone drops lower, text moves to top. Phone top edge
          tucks behind the last line of text via positioning. */}
      <div className="relative z-10 min-h-screen">
        {/* Copy — always on top, never affected by phone position */}
        <div className="relative z-20 flex flex-col justify-end min-h-screen px-6 pb-[30vh] sm:px-10 md:px-16 md:pb-[clamp(4rem,10vh,8rem)] lg:px-24 pointer-events-none [&_*]:pointer-events-none">
          <SectionLabel label={t('hero.sectionLabel')} className="mb-6" />

          <h1
            className="font-heading font-bold uppercase leading-[0.95] tracking-tight text-ops-text-primary text-[2.5rem] sm:text-[5rem]"
          >
            {t('hero.headingLine1')}
            <br />
            {t('hero.headingLine2')}
            <br />
            {t('hero.headingLine3')}
          </h1>

          <p className="mt-6 font-caption uppercase tracking-[0.15em] text-sm text-ops-text-secondary">
            {t('hero.subtext')}
          </p>
        </div>

        {/* 3D Phone Scene — always absolutely positioned, behind text.
            Desktop: right-aligned, full height.
            Mobile: centered-right, shorter, scaled down via viewport units. */}
        {/* Phone container — always absolutely positioned, scales with viewport.
            lg+: right-aligned, 55% width, full height.
            md-lg: right-aligned, 70vw, full height (phone slides behind text).
            <md: centered, 100vw, lower 65% of hero. */}
        <div
          className="absolute z-10 top-0 h-full right-0 w-[55%] max-lg:w-[70vw] max-md:w-[100vw] max-md:right-auto max-md:left-1/2 max-md:-translate-x-1/2 max-md:top-[35%] max-md:h-[65%]"
          aria-hidden="true"
        >
          <PhoneSceneWrapper />
        </div>
      </div>
    </section>
  );
}
