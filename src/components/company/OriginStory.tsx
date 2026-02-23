/**
 * OriginStory — The founder's story in three paragraphs
 *
 * Server component. Left-aligned Mohave body text with generous
 * spacing and staggered FadeInUp animations.
 */

import { SectionLabel, FadeInUp } from '@/components/ui';

export default function OriginStory() {
  return (
    <section className="py-24 md:py-32 bg-ops-background">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <FadeInUp>
          <SectionLabel label="THE STORY" className="mb-12" />
        </FadeInUp>

        <div className="max-w-3xl space-y-8">
          <FadeInUp delay={0}>
            <p className="font-body text-lg md:text-xl font-light leading-relaxed text-ops-text-secondary">
              I started in construction at sixteen. Summer laborer. Carrying
              lumber, digging footings, learning that the job site doesn&apos;t
              care about your excuses. Spent ten years building decks and
              railings — started my own company, scaled it from zero to $1.6
              million in four years.
            </p>
          </FadeInUp>

          <FadeInUp delay={0.1}>
            <p className="font-body text-lg md:text-xl font-light leading-relaxed text-ops-text-secondary">
              The bigger the crew got, the worse the coordination got. I tried
              every piece of software out there. Jobber. ServiceTitan. Housecall
              Pro. My guys would open the app once, get lost in a maze of tabs
              and dropdown menus, and go right back to the group text. I was
              paying for software nobody used.
            </p>
          </FadeInUp>

          <FadeInUp delay={0.2}>
            <p className="font-body text-lg md:text-xl font-light leading-relaxed text-ops-text-secondary">
              So I built what should have existed all along. One app. Open it,
              see your jobs, know where to go. No training manual. No onboarding
              webinar. If your crew can read a tape measure, they can use OPS.
            </p>
          </FadeInUp>
        </div>
      </div>
    </section>
  );
}
