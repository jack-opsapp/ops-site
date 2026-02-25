/**
 * Plans page — Pricing tiers, FAQ, and bottom CTA
 *
 * Three pricing cards (Starter, Team, Business) with FAQ section.
 */

import type { Metadata } from 'next';
import { FadeInUp } from '@/components/ui';
import PlansHero from '@/components/plans/PlansHero';
import PricingCard from '@/components/plans/PricingCard';
import FAQ from '@/components/shared/FAQ';
import BottomCTA from '@/components/shared/BottomCTA';

const APP_STORE_URL = 'https://apps.apple.com/us/app/ops-job-crew-management/id6746662078';

export const metadata: Metadata = {
  title: 'Plans',
  description:
    'Start free. Upgrade when you\'re ready. No credit card, no commitment. All plans include every feature — you only pay based on crew size.',
};

const pricingTiers = [
  {
    name: 'Free Trial',
    price: 'FREE',
    interval: '30 days',
    users: 'UP TO 10 USERS',
    bestFor: 'Try everything before you commit',
    features: [
      'Full feature access',
      'Up to 10 users',
      'No credit card required',
      'Task management & scheduling',
      'Photo storage & upload',
      'Full project database',
    ],
    ctaText: 'START FREE TRIAL',
    ctaHref: APP_STORE_URL,
  },
  {
    name: 'Starter',
    price: '$90',
    interval: '/mo or $864/yr (20% off)',
    users: 'UP TO 3 USERS',
    bestFor: 'Owner-operator or small crew. 1-3 people, looking to get organized.',
    features: [
      'Full feature access',
      'Task management & crew scheduling',
      'Photo storage & upload',
      'Full project database',
      'Client database management',
      'Unlimited project & photo storage',
    ],
    ctaText: 'GET STARTED',
    ctaHref: APP_STORE_URL,
  },
  {
    name: 'Team',
    price: '$140',
    interval: '/mo or $1,344/yr (20% off)',
    users: 'UP TO 5 USERS',
    bestFor: 'Growing operation. 4-5 team members, ready to streamline coordination.',
    features: [
      'Full feature access',
      'Task management & crew scheduling',
      'Photo storage & upload',
      'Full project database',
      'Client database management',
      'Unlimited project & photo storage',
    ],
    recommended: true,
    ctaText: 'GET OPS',
    ctaHref: APP_STORE_URL,
  },
  {
    name: 'Business',
    price: '$190',
    interval: '/mo or $1,824/yr (20% off)',
    users: 'UP TO 10 USERS',
    bestFor: 'Established operation running many jobs concurrently. 6-10 team members.',
    features: [
      'Full feature access',
      'Task management & crew scheduling',
      'Photo storage & upload',
      'Full project database',
      'Client database management',
      'Unlimited project & photo storage',
    ],
    ctaText: 'GET STARTED',
    ctaHref: APP_STORE_URL,
  },
];

const faqItems = [
  {
    question: 'Why should I switch from Jobber?',
    answer:
      'Honestly? If Jobber works for you and your crew uses it, don\'t switch. OPS is for crews who tried Jobber and found it too complicated, or who are still using group texts and need something simple.',
  },
  {
    question: 'What if you\'re missing a feature I need?',
    answer:
      'Tell me. If it makes sense for crews like yours, we\'ll build it. We\'re not trying to be everything to everyone \u2014 we\'re building exactly what field crews need, in the order they need it.',
  },
  {
    question: 'How do I know you won\'t shut down?',
    answer:
      'Fair question. Here\'s the honest answer: I built this because I needed it. It\'s solving my problem and yours. I\'m not going anywhere. Month-to-month pricing means no risk for you. Your data exports anytime.',
  },
  {
    question: 'Can my crew actually use this without training?',
    answer:
      'Download it right now. Open it. If you can\'t figure out how to create a job in 60 seconds, it failed. That\'s the standard.',
  },
  {
    question: 'Can I import my Jobber data?',
    answer:
      'Manual import available now with our help. One-click import coming Q3 2026. Either way, you don\'t lose your history.',
  },
  {
    question: 'Why should I try the tutorial first?',
    answer:
      'Two reasons: (1) You see exactly how OPS works before downloading anything. (2) You stay warm through the download \u2014 when you open the app, you already know what you\'re doing.',
  },
];

export default function PlansPage() {
  return (
    <>
      <PlansHero />

      {/* Pricing cards */}
      <section className="py-16 md:py-24 bg-ops-background">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingTiers.map((tier, index) => (
              <FadeInUp key={tier.name} delay={index * 0.08}>
                <PricingCard
                  name={tier.name}
                  price={tier.price}
                  interval={tier.interval}
                  users={tier.users}
                  bestFor={tier.bestFor}
                  features={tier.features}
                  recommended={tier.recommended}
                  ctaText={tier.ctaText}
                  ctaHref={tier.ctaHref}
                />
              </FadeInUp>
            ))}
          </div>

          {/* Callout */}
          <FadeInUp delay={0.4}>
            <p className="font-heading font-light text-sm text-ops-text-secondary text-center mt-12 max-w-[700px] mx-auto">
              After your free trial, pick the plan that fits your crew size. All plans include the same features &mdash; you only pay based on how many people you&apos;re managing.
            </p>
          </FadeInUp>
        </div>
      </section>

      <FAQ label="QUESTIONS YOU'RE PROBABLY ASKING" items={faqItems} />

      <BottomCTA
        heading="YOUR CREW DESERVES SOFTWARE THAT WORKS AS HARD AS YOU DO"
        subtext="Stop coordinating through chaos. Get OPS."
        buttonText="DOWNLOAD FREE"
        buttonHref={APP_STORE_URL}
        external
      />
    </>
  );
}
