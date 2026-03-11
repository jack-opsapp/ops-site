import { SectionLabel, FadeInUp, Button, GradientOverlay } from '@/components/ui';

const APP_STORE_URL = 'https://apps.apple.com/us/app/ops-job-crew-management/id6746662078';

interface IndustryHeroProps {
  sectionLabel: string;
  headline: string;
  subtext: string;
}

export default function IndustryHero({ sectionLabel, headline, subtext }: IndustryHeroProps) {
  return (
    <section className="relative min-h-[85vh] w-full overflow-hidden bg-ops-background">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f0f] via-ops-background to-[#060606]" />

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

      <GradientOverlay direction="to-bottom" opacity={0.6} />

      <div className="relative z-10 flex min-h-[85vh] flex-col justify-end px-6 pb-[clamp(4rem,10vh,8rem)] sm:px-10 md:px-16 lg:px-24">
        <FadeInUp>
          <SectionLabel label={sectionLabel} className="mb-4" />
        </FadeInUp>

        <FadeInUp delay={0.05}>
          <h1
            className="font-heading font-bold uppercase leading-[0.95] tracking-tight text-ops-text-primary max-w-[800px]"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}
          >
            {headline}
          </h1>
        </FadeInUp>

        <FadeInUp delay={0.1}>
          <p className="mt-4 font-heading font-light text-lg text-ops-text-secondary sm:text-xl md:text-2xl max-w-[600px]">
            {subtext}
          </p>
        </FadeInUp>

        <FadeInUp delay={0.15}>
          <div className="mt-8 flex items-center gap-4">
            <Button variant="solid" href={APP_STORE_URL} external>
              DOWNLOAD FREE
            </Button>
            <Button variant="ghost" href="https://try.opsapp.co/tutorial-intro" external>
              TRY IT FIRST
            </Button>
          </div>
          <p className="mt-4 font-caption text-xs text-ops-text-secondary tracking-[0.1em]">
            Get started for free · No credit card · No training required
          </p>
        </FadeInUp>
      </div>
    </section>
  );
}
