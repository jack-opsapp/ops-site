import { Button, FadeInUp } from '@/components/ui';

const APP_STORE_URL = 'https://apps.apple.com/us/app/ops-job-crew-management/id6746662078';

interface IndustryCTAProps {
  headline: string;
  subtext: string;
}

export default function IndustryCTA({ headline, subtext }: IndustryCTAProps) {
  return (
    <section className="relative py-32 md:py-40 bg-ops-background overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, #0A0A0A 0%, #111111 40%, #0E0E0E 70%, #0A0A0A 100%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-10">
        <FadeInUp>
          <h2 className="font-heading font-bold uppercase leading-[0.95] tracking-tight text-ops-text-primary text-4xl md:text-6xl max-w-[800px]">
            {headline}
          </h2>
        </FadeInUp>

        <FadeInUp delay={0.08}>
          <p className="mt-6 font-heading font-light text-lg md:text-xl text-ops-text-secondary">
            {subtext}
          </p>
        </FadeInUp>

        <FadeInUp delay={0.14}>
          <div className="mt-10 flex items-center gap-4">
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
